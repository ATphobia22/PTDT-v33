from __future__ import annotations

import hashlib
import logging
import os
import time
from pathlib import Path

import boto3
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

LOGGER = logging.getLogger(__name__)


class FemaPackageUploadHandler(FileSystemEventHandler):
    def __init__(self, bucket: str, region: str, kms_key_id: str | None = None) -> None:
        self.bucket = bucket
        self.kms_key_id = kms_key_id
        self.s3 = boto3.client("s3", region_name=region)

    @staticmethod
    def _stable(path: Path, interval_s: float = 0.25) -> bool:
        try:
            first = path.stat().st_size
            time.sleep(interval_s)
            return path.exists() and path.stat().st_size == first
        except FileNotFoundError:
            return False

    def on_created(self, event) -> None:
        if event.is_directory:
            return
        path = Path(event.src_path)
        if path.name.startswith("FEMA_HMA_APPEAL_DOSSIER_") and path.name.endswith(".tar.gz") and self._stable(path):
            self.upload(path)

    def upload(self, path: Path) -> str:
        sha256_hex = hashlib.sha256(path.read_bytes()).hexdigest()
        extra_args = {
            "ServerSideEncryption": "aws:kms",
            "Metadata": {"envelope-sha256": sha256_hex, "artifact": "ptdt-fema-evidence"},
            "ChecksumAlgorithm": "SHA256",
        }
        if self.kms_key_id:
            extra_args["SSEKMSKeyId"] = self.kms_key_id
        key = f"incoming/appeals/{path.name}"
        self.s3.upload_file(str(path), self.bucket, key, ExtraArgs=extra_args)
        LOGGER.info("appeal artifact uploaded key=%s sha256=%s", key, sha256_hex)
        return key


def run(watch_directory: str = "build") -> None:
    bucket = os.environ.get("PTDT_FEMA_BUCKET")
    if not bucket:
        raise RuntimeError("PTDT_FEMA_BUCKET must be configured; no default bucket is permitted")
    handler = FemaPackageUploadHandler(bucket, os.environ.get("AWS_DEFAULT_REGION", "us-east-2"), os.environ.get("PTDT_FEMA_KMS_KEY_ID"))
    observer = Observer()
    observer.schedule(handler, watch_directory, recursive=False)
    observer.start()
    try:
        while observer.is_alive():
            observer.join(timeout=1.0)
    finally:
        observer.stop()
        observer.join()
