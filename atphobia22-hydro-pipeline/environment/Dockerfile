# Lock to stable Databricks standard baseline running Python 3.10+
FROM databricksruntime/standard:14.3-LTS

# Install absolute baseline prerequisites for spatial, software compilation, and MATLAB runtimes
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin=3.8.4* libgdal-dev=3.8.4* \
    proj-bin=9.3.1* libproj-dev=9.3.1* \
    libgeos-dev=3.12.1* cargo gcc git curl openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Map explicit compilation pathing targets for compiled bindings
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Securely clone and natively compile the foundational ATphobia22 stack
RUN git clone https://github.com/opt/rgis && cd /opt/rgis && pip install .
RUN git clone https://github.com/opt/timedb && cd /opt/timedb && pip install .
RUN git clone https://github.com/opt/dl-benchmark && cd /opt/dl-benchmark && pip install .
RUN git clone https://github.com/opt/township-twin && cd /opt/township-twin && pip install .
RUN git clone https://github.com/opt/tucker-os && cd /opt/tucker-os && pip install .

# Compile and bind newly discovered core spatial infrastructure and commander engines
RUN git clone https://github.com/opt/cwms-cli && cd /opt/cwms-cli && pip install .
RUN git clone https://github.com/opt/ras-commander && cd /opt/ras-commander && pip install .
RUN git clone https://github.com/opt/flopy && cd /opt/flopy && pip install .
RUN git clone https://github.com/opt/matlab-mcp && cd /opt/matlab-mcp && pip install .

# Freeze adjacent python layers and install baseline verification tools
RUN pip install --no-cache-dir numpy==1.26.4 fiona==1.9.6 shapely==2.0.3 rasterio==1.3.10 geopandas==0.14.3 pytest==8.1.1 surrealdb==0.3.2 requests==2.31.0
