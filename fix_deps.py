with open("src/components/NextGenDigitalTwin.tsx", "r") as f:
    content = f.read()

# fetchTelemetry useEffect
content = content.replace("fetchTelemetry();\n  }, [theme]);", "fetchTelemetry();\n  }, []);")

with open("src/components/NextGenDigitalTwin.tsx", "w") as f:
    f.write(content)
