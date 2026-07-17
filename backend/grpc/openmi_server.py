import asyncio
import logging
import traceback
import grpc
from concurrent import futures
from typing import Dict, Any, Callable, Awaitable
from grpc import StatusCode

import backend.schemas.protobuf.openmi_pb2 as pb2
import backend.schemas.protobuf.openmi_pb2_grpc as pb2_grpc
from backend.plugins.hec_ras import HecRasOpenMIAdapter
from backend.plugins.swmm import SwmmOpenMIAdapter
from backend.plugins.modflow import ModflowOpenMIAdapter
from backend.plugins.bishop import BishopOpenMIAdapter

logger = logging.getLogger("ptdt.openmi.grpc")

class GrpcExceptionInterceptor(grpc.aio.ServerInterceptor):
    async def intercept_service(self, continuation, handler_call_details):
        handler = await continuation(handler_call_details)
        if handler is None:
            return handler
        original = handler.unary_unary
        async def intercepted(request, context):
            try:
                return await original(request, context)
            except Exception as e:
                logger.error(f"gRPC error in {handler_call_details.method}: {str(e)}", exc_info=True)
                await context.abort(StatusCode.INTERNAL, str(e))
        return grpc.unary_unary_rpc_method_handler(
            intercepted,
            request_deserializer=handler.request_deserializer,
            response_serializer=handler.response_serializer
        )

class ModelIntegrationServicer(pb2_grpc.ModelIntegrationServicer):
    def __init__(self):
        self.adapters = {
            "SWMM": SwmmOpenMIAdapter(),
            "HEC_RAS": HecRasOpenMIAdapter(),
            "MODFLOW": ModflowOpenMIAdapter(),
            "BISHOP": BishopOpenMIAdapter()
        }
        self.active_runs: Dict[str, Dict[str, Any]] = {}

    async def Initialize(self, request, context):
        try:
            config = {
                "scenario": request.scenario,
                "mesh_path": request.mesh,
                "dt": request.timestep_seconds
            }
            logger.info(f"Initiating OpenMI Session for run: {request.run_id}")
            init_tasks = {name: adapter.initialize(config) for name, adapter in self.adapters.items()}
            results = await asyncio.gather(*init_tasks.values(), return_exceptions=True)
            failed_components = []
            for (name, task_res), status in zip(init_tasks.items(), results):
                if isinstance(status, Exception) or not status:
                    failed_components.append(name)
                    logger.error(f"Component [{name}] failed initialization: {status}")
            if failed_components:
                return pb2.InitializeResponse(
                    success=False,
                    message=f"Initialization aborted. Failed components: {', '.join(failed_components)}"
                )
            self.active_runs[request.run_id] = {
                "step": 0,
                "max_steps": request.max_steps,
                "dt": request.timestep_seconds,
                "state_cache": {}
            }
            return pb2.InitializeResponse(success=True, message="All OpenMI solvers online and synchronized.")
        except Exception as e:
            logger.error(f"Initialize failed: {str(e)}", exc_info=True)
            await context.abort(StatusCode.INTERNAL, str(e))

    async def PerformTimeStep(self, request, context):
        try:
            run = self.active_runs.get(request.run_id)
            if not run:
                await context.abort(StatusCode.NOT_FOUND, "Unknown component")
            dt = run["dt"]
            step = run["step"]
            swmm_res = await self.adapters["SWMM"].perform_time_step(dt)
            if swmm_res.get("status") == "FAILED":
                raise RuntimeError(f"SWMM simulation failed at step {step}")
            flow_rates = [float(x) for x in swmm_res["discharge_cms"]]
            await self.adapters["HEC_RAS"].set_values("InflowRate", "InflowNode_BC", flow_rates)
            ras_res = await self.adapters["HEC_RAS"].perform_time_step(dt)
            if ras_res.get("status") == "FAILED":
                raise RuntimeError(f"HEC-RAS simulation failed at step {step}")
            await self.adapters["MODFLOW"].set_values("SurfaceHead", "AquiferBoundary", ras_res["water_level"])
            modflow_res = await self.adapters["MODFLOW"].perform_time_step(dt)
            if modflow_res.get("status") == "FAILED":
                raise RuntimeError(f"MODFLOW simulation failed at step {step}")
            await self.adapters["BISHOP"].set_values("SurfaceWaterLevel", "RiverBankEdge", ras_res["water_level"])
            await self.adapters["BISHOP"].set_values("PorePressure", "SlipPlaneSoil", modflow_res["pore_pressure_kpa"])
            bishop_res = await self.adapters["BISHOP"].perform_time_step(dt)
            if bishop_res.get("status") == "FAILED":
                raise RuntimeError(f"Bishop slope stability calculation failed at step {step}")
            run["state_cache"] = {
                "swmm": swmm_res,
                "hec_ras": ras_res,
                "modflow": modflow_res,
                "bishop": bishop_res
            }
            run["step"] += 1
            return pb2.TimeStepResponse(
                success=True,
                current_step=run["step"],
                completed=(run["step"] >= run["max_steps"])
            )
        except Exception as e:
            logger.error(f"PerformTimeStep failed: {str(e)}", exc_info=True)
            await context.abort(StatusCode.INTERNAL, str(e))

    async def GetValues(self, request, context):
        run = self.active_runs.get(request.run_id)
        if not run:
            await context.abort(StatusCode.NOT_FOUND, "Unknown component")
        cache = run["state_cache"]
        exchange = pb2.OpenMIExchange(
            component_id="PTDT_CONSOLIDATED_COUPLER",
            timestamp=pb2.Timestamp(seconds=int(request.timestamp_epoch), nanos=0)
        )
        if "hec_ras" in cache:
            levels = cache["hec_ras"]["water_level"]
            exchange.scalar_values["avg_water_level_m"] = sum(levels) / len(levels) if levels else 0.0
        if "bishop" in cache:
            exchange.scalar_values["slope_factor_of_safety"] = cache["bishop"]["fos"]
        return exchange

    async def Finish(self, request, context):
        logger.info(f"Teardown sequence initiated for run {request.run_id}")
        for name, adapter in self.adapters.items():
            await adapter.finish()
        self.active_runs.pop(request.run_id, None)
        return pb2.FinishResponse(success=True)

async def serve_grpc():
    server = grpc.aio.server(
        futures.ThreadPoolExecutor(max_workers=10),
        interceptors=[GrpcExceptionInterceptor()]
    )
    pb2_grpc.add_ModelIntegrationServicer_to_server(ModelIntegrationServicer(), server)
    server.add_insecure_port('[::]:50051')
    await server.start()
    logger.info("   OpenMI gRPC server running on port 50051")
    await server.wait_for_termination()

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    asyncio.run(serve_grpc())
