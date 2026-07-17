import grpc
import logging
from backend.core.config import settings
import backend.schemas.protobuf.openmi_pb2 as pb2
import backend.schemas.protobuf.openmi_pb2_grpc as pb2_grpc

logger = logging.getLogger("ptdt.temporal")

class TemporalOpenMIWorkflow:
    def __init__(self, run_id: str, payload: dict):
        self.run_id = run_id
        self.payload = payload
        self.grpc_channel = grpc.aio.insecure_channel("localhost:50051")
        self.client = pb2_grpc.ModelIntegrationStub(self.grpc_channel)

    async def execute_durable_simulation(self) -> dict:
        try:
            logger.info(f"[Temporal] Initiating transaction for twin run: {self.run_id}")
            init_req = pb2.InitializeRequest(
                run_id=self.run_id,
                scenario=self.payload.get("scenario", "100-year-flood"),
                mesh=self.payload.get("mesh", "point_township_v32"),
                timestep_seconds=30.0,
                max_steps=24
            )
            init_resp = await self.client.Initialize(init_req)
            if not init_resp.success:
                raise RuntimeError(f"Solvers failed to initialize: {init_resp.message}")

            completed = False
            step = 0
            while not completed and step < 24:
                step_req = pb2.TimeStepRequest(run_id=self.run_id)
                step_resp = await self.client.PerformTimeStep(step_req)
                if not step_resp.success:
                    raise RuntimeError(f"Solver convergence failed during step {step}")
                completed = step_resp.completed
                step = step_resp.current_step
                logger.debug(f"[Temporal] Time-step completed: {step}/24")

            val_req = pb2.GetValuesRequest(run_id=self.run_id, timestamp_epoch=1781600000.0)
            exchange_data = await self.client.GetValues(val_req)

            await self.client.Finish(pb2.FinishRequest(run_id=self.run_id))
            await self.grpc_channel.close()
            logger.info(f"[Temporal] Transaction finalized successfully for run: {self.run_id}")
            
            return {
                "status": "COMPLETED",
                "final_safety_factor": exchange_data.scalar_values.get("slope_factor_of_safety", 1.5),
                "average_flood_depth_m": exchange_data.scalar_values.get("avg_water_level_m", 0.0)
            }
        except Exception as e:
            logger.error(f"[Temporal] Fatal error within simulation worker boundary: {str(e)}")
            await self.grpc_channel.close()
            return {"status": "FAILED", "error": str(e)}
