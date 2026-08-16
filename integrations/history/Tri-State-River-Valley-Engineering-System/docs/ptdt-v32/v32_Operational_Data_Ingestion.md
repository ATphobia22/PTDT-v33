# PTDT v32 Operational Data Ingestion Plan

## 1. System Architecture
The data ingestion pipeline provides high-throughput, low-latency telemetry to the EnKF Assimilation module. It operates via Apache Kafka to decouple data producers (sensors, APIs) from consumers (PTDT Twin State Manager).

## 2. Supported Telemetry Sources

### 2.1 USGS National Water Information System (NWIS)
*   **Data**: Stream stage, discharge, water temperature.
*   **Frequency**: 15-minute intervals.
*   **Protocol**: REST API polling -> Kafka Topic `telemetry.usgs.stream`.

### 2.2 NOAA MRMS (Multi-Radar Multi-Sensor)
*   **Data**: Gridded precipitation estimates (QPE).
*   **Frequency**: 2-minute updates.
*   **Protocol**: GRIB2 FTP download -> Python raster processor -> Kafka Topic `telemetry.noaa.mrms`.

### 2.3 SCADA & IoT Sensor Networks
*   **Data**: Pump station flows, gate elevations, piezometer groundwater heads, levee moisture.
*   **Frequency**: Sub-minute streaming.
*   **Protocol**: MQTT over TLS -> Kafka Topic `telemetry.scada.iot`.

## 3. Data Quality Control (QC) Pipeline
Before data enters the physical models, it undergoes automated QC to prevent erroneous updates.

1.  **Range Checks**: Values outside physical limits (e.g., negative discharge, pump flow > capacity) are discarded.
2.  **Rate of Change (RoC)**: Spikes exceeding defined thresholds (e.g., $+5$ ft stage in 1 minute) are flagged as sensor errors.
3.  **Missing Data Imputation**:
    *   Short gaps (< 1 hour): Linear interpolation.
    *   Long gaps (> 1 hour): Surrogate neural network imputation based on upstream/downstream sensors.
4.  **Confidence Scoring**: Each observation is assigned a confidence matrix $\mathbf{R}_t$ (used directly by EnKF). High noise or imputed data receives a low confidence weight.

## 4. Archival and Replay
All ingested telemetry is permanently archived in Amazon S3 (Parquet format) and indexed in TimescaleDB. This enables the system to "replay" historical storms (e.g., 2011 floods) exactly as the sensors recorded them, verifying model hindcast accuracy.
