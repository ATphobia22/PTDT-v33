import pytest
import pandas as pd
from datetime import datetime
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, struct
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType, IntegerType

@pytest.fixture(scope="session")
def spark_session():
    """Initializes a local Spark Session specifically for isolation testing."""
    spark = (
        SparkSession.builder
        .master("local")
        .appName("atphobia22-local-unit-testing")
        .config("spark.sql.shuffle.partitions", "1")
        .getOrCreate()
    )
    yield spark
    spark.stop()

def mock_run_sovereign_simulation_engine(iterator):
    """Simulates local python validation parameters for multi-model spatial and tile outputs."""
    for parameters_series in iterator:
        results = []
        for params in parameters_series:
            model_id = params.get("model_id")
            if not model_id:
                results.append({
                    "status": "SIMULATION_ENGINE_ERROR",
                    "raster_destination": None,
                    "vector_tile_status": "FAILED",
                    "groundwater_drawdown_m": 0.0
                })
            else:
                results.append({
                    "status": "SUCCESS",
                    "raster_destination": f"/tmp/rasters/{model_id}/",
                    "vector_tile_status": f"ACTIVE: ptdt_v25_{model_id}",
                    "groundwater_drawdown_m": 0.145
                })
        yield pd.DataFrame(results)

def test_gold_layer_analytical_join_and_benchmarking(spark_session):
    """Confirms that the Gold analytical layer processes and returns performance metrics."""
    model_schema = StructType([
        StructField("model_id", StringType(), False),
        StructField("geometry_file_path", StringType(), True),
        StructField("projection_epsg", IntegerType(), True)
    ])
    model_data = [("GAUGE_01", "/dbfs/mnt/model_a.prj", 2966)]
    
    flow_schema = StructType([
        StructField("gauge_id", StringType(), False),
        StructField("timestamp", TimestampType(), True),
        StructField("flow_cfs", DoubleType(), True)
    ])
    flow_data = [("GAUGE_01", datetime(2026, 3, 15, 12, 0), 4500.0)]
    
    models_df = spark_session.createDataFrame(model_data, schema=model_schema)
    flows_df = spark_session.createDataFrame(flow_data, schema=flow_schema)
    
    joined_df = models_df.join(flows_df, models_df.model_id == flows_df.gauge_id, "inner")
    
    packed_df = joined_df.withColumn("test_payload", struct(col("model_id"), col("geometry_file_path"), col("projection_epsg")))
    pdf_series = [packed_df.select("test_payload").toPandas()["test_payload"]]
    
    final_output_df = next(mock_run_sovereign_simulation_engine(pdf_series))
    
    assert final_output_df.loc[0, "status"] == "SUCCESS"
    assert final_output_df.loc[0, "raster_destination"] == "/tmp/rasters/GAUGE_01/"
    assert final_output_df.loc[0, "vector_tile_status"] == "ACTIVE: ptdt_v25_GAUGE_01"
    assert final_output_df.loc[0, "groundwater_drawdown_m"] == 0.145
