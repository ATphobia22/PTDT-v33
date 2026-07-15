import os
import sys
import requests

def verify_databricks_connectivity():
    """Validates that the deployment host and token can communicate with Databricks APIs."""
    # Pull parameters from active system variables
    host = os.environ.get("DATABRICKS_HOST")
    token = os.environ.get("DATABRICKS_TOKEN")

    if not host or not token:
        print("[-] DEPLOYMENT ERROR: Missing local DATABRICKS_HOST or DATABRICKS_TOKEN variables.")
        sys.exit(1)

    # Clean trailing slashes if present
    host = host.rstrip("/")
    endpoint = f"{host}/api/2.0/preview/scim/v2/Me"
    headers = {"Authorization": f"Bearer {token}"}

    print(f"[*] Attempting secure handshake with workspace target: {host}...")

    try:
        response = requests.get(endpoint, headers=headers, timeout=10)
        if response.status_code == 200:
            print("[+] SUCCESS: Authentication token verified. Databricks CLI is clear to deploy bundles.")
            sys.exit(0)
        else:
            print(f"[-] AUTHENTICATION FAILED: Server responded with status code {response.status_code}.")
            print(f"[-] Response Payload: {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"[-] NETWORK ERROR: Unable to establish a connection to the host. Details: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    verify_databricks_connectivity()
