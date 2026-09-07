import math
import pytest

from ptdt_v35_core.contracts.spatial_reference import SpatialReferenceContract


def valid() -> SpatialReferenceContract:
    return SpatialReferenceContract("EPSG:2966", "NAVD88", "2026", "ftUS", "xy")


def test_valid_contract_and_coordinates() -> None:
    contract = valid()
    contract.validate()
    contract.validate_coordinate(1.0, 2.0, 3.0)


def test_missing_vertical_datum_rejected() -> None:
    contract = SpatialReferenceContract("EPSG:2966", "", "2026", "ftUS", "xy")
    with pytest.raises(ValueError):
        contract.validate()


def test_non_finite_coordinate_rejected() -> None:
    with pytest.raises(ValueError):
        valid().validate_coordinate(math.nan, 2.0)


def test_unsupported_units_rejected() -> None:
    contract = SpatialReferenceContract("EPSG:2966", "NAVD88", "2026", "yards", "xy")
    with pytest.raises(ValueError):
        contract.validate()
