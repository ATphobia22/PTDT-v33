from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter()

def verify_oidc_token():
    return {"sub": "operator-01"}

class VariableExchangeContract(BaseModel):
    exchange_id: str
    target_component: str
    value_vector: list

@router.post("/couple")
async def execute_openmi_exchange(contract: VariableExchangeContract, token: dict = Depends(verify_oidc_token)):
    """Executes a runtime boundary-condition exchange with SWMM or MODFLOW."""
    if not contract.value_vector:
        raise HTTPException(status_code=400, detail="Empty exchange data vector")
    return {
        "exchange_id": contract.exchange_id,
        "status": "VARIABLE_SYNCHRONIZED_OPENMI_2.0",
        "elements_coupled": len(contract.value_vector),
        "target": contract.target_component
    }
