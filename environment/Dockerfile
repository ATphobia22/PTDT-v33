# Lock to stable Databricks standard baseline running Python 3.10+
FROM databricksruntime/standard:14.3-LTS

# Install absolute baseline prerequisites for spatial compilation, Rust, and Protobuf bindings
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin=3.8.4* libgdal-dev=3.8.4* \
    proj-bin=9.3.1* libproj-dev=9.3.1* \
    libgeos-dev=3.12.1* cargo gcc git curl protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

# Map explicit compilation pathing targets for compiled bindings
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Securely clone and natively compile the foundational ATphobia22 stack
RUN git clone https://github.com/atphobia22/rgis /opt/rgis && cd /opt/rgis && pip install .
RUN git clone https://github.com/atphobia22/timedb /opt/timedb && cd /opt/timedb && pip install .
RUN git clone https://github.com/atphobia22/dl-benchmark /opt/dl-benchmark && cd /opt/dl-benchmark && pip install .

# Ingest newly exposed Tri-State System template frameworks (Citadel & Spatial Core Engines)
RUN git clone https://github.com/atphobia22/Tri-State-Family-Engineering-System- /opt/tsfes
RUN cd /opt/tsfes/python/citadel && pip install .

# Freeze adjacent python layers and include structural gRPC toolsets
RUN pip install --no-cache-dir \
    numpy==1.26.4 \
    fiona==1.9.6 \
    shapely==2.0.3 \
    rasterio==1.3.10 \
    geopandas==0.14.3 \
    pytest==8.1.1 \
    surrealdb==0.3.2 \
    protobuf==4.25.3 \
    grpcio==1.62.1
