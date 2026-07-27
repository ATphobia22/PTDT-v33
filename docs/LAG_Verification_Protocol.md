# LAG Verification Protocol: 13101 Bonebank Road

This protocol outlines the forensic engineering steps required to verify the **377.2 ft Lowest Adjacent Grade (LAG)** for a Letter of Map Amendment (LOMA) application, ensuring compliance with FEMA 44 CFR Part 70 and Indiana IC 25-31-1.

## 1. Technical Requirements & Standards

### 1.1 Vertical Datum (NAVD 88)
*   **Requirement**: All elevation data MUST be referenced to the **North American Vertical Datum of 1988 (NAVD 88)**.
*   **Caveat**: Legacy data using **NGVD 29** must be converted using the National Geodetic Survey (NGS) **NCAT** tool or based on the local Flood Insurance Study (FIS) conversion factor. A datum mismatch is the most common cause of LOMA rejection.

### 1.2 Topographic Precision
*   **Baseline**: Utilize high-fidelity **LiDAR** (standard QL2 or better). While the project utilizes 5cm high-precision LiDAR for work maps, FEMA typically requires a certified elevation from a Professional Land Surveyor or Engineer for the final MT-1/MT-EZ form.
*   **Work Map**: The LiDAR data establishes property-specific contours and visualizes the relationship between the structure and the Base Flood Elevation (BFE).

## 2. Evidence Chain & Verification Steps

### Step 1: Base Flood Elevation (BFE) Determination
*   Consult the effective **FEMA Flood Insurance Rate Map (FIRM)** or the **Indiana Floodplain Information Portal (INFIP)**.
*   For 13101 Bonebank Road, the regulatory BFE is established at **375.0 ft MSL (NAVD 88)**.

### Step 2: LAG Measurement
*   The Professional Engineer (P.E.) or Surveyor must measure the **Lowest Adjacent Grade (LAG)**, which is the lowest point of the ground immediately adjacent to the structure.
*   Current project verification: **377.2 ft MSL (NAVD 88)**.
*   **Clearance Vector**: +2.2 ft (LAG 377.2 - BFE 375.0).

### Step 3: Natural Ground Attestation
*   The engineer must verify if the structure sits on **natural high ground**.
*   If fill was placed to raise the structure above the BFE, a **LOMA-F** (based on fill) is required instead of a standard LOMA.
*   For a Pure LOMA, certify that no artificial fill was used to elevate the subject property.

### Step 4: Hydrodynamic Calibration (Optional/Supporting)
*   Utilize **Archimedes Engine** to calibrate the site's hydraulic profile against **USGS Gauge 03378500** (Wabash River at New Harmony).
*   This telemetry provides context for regional flooding behavior but does not replace the requirement for a certified site-specific LAG.

## 3. Statutory Certification (Indiana IC 25-31-1)

*   All topographic work maps and LOMA transmittals must be certified under the **Professional Seal** of a Registered Professional Engineer in Indiana.
*   **Forensic Statement**: "The technical data and topographic work maps attached were performed under my direct supervision and exceed standard FEMA Risk MAP specifications."

## 4. Documentation & Submission

*   **FEMA Portal**: Submit via the **Online LOMC** tool on the FEMA GO portal.
*   **Case Study PDF**: Compile a forensic case study including high-resolution renders, site photos, and a SHA256-verified manifest of artifacts.
*   **Digital Manifest**: Host the full render and supporting datasets on the **Sovereign Node** with a secure link provided in the transmittal.

---
*Note: This protocol is a guideline. Final certification must be provided by a licensed professional in accordance with state and federal law.*
