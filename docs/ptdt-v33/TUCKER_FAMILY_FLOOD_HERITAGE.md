# Tucker Family Flood Heritage & Point Township Ground Truth

**Primary source:** Tucker Family Flood History and Heritage workbook (compiled 2026)  
**Anchor:** 13101 Bonebank Road, Point Township, Posey County, IN 47620  
**Authority rule:** Family stage→impact ladder is **ground-truth operations**; regulatory BFE/LAG remain **NAVD88 seals** (Material Truth / LOMA path).

---

## 1. Two elevation systems (must not mix)

| System | Units | Use |
|---|---|---|
| **J.T. Myers gage stage** | ft above **gage datum** | Family triggers: dock, bridge, road, house |
| **NAVD88 site elevations** | ft NAVD88 | BFE 375.0 · LAG 377.2 · FFE 382.5 · crest design |

Myers is **navigational** (not a flood-control dam). Stage predicts **property impact** via the family ladder; NAVD88 proves **LOMA natural high ground** (+2.2 ft LAG−BFE).

---

## 2. Property flood trigger ladder (J.T. Myers stage ft)

| Myers stage (ft) | Impact | Location |
|---|---|---|
| **54.93** | ALERT — bank full | Dock (G’Okoge) |
| **55.55** | WARNING — bridge begins | Swain Bridge, Ohio side |
| **55.85–56.25** | WARNING | Water at / over bridge top |
| **56.75** | DANGER — road floods | Road past bridge |
| **57.25** | DANGER | Near Bobby’s house; pole barn −3 ft |
| **57.85** | DANGER | Barn; ~5 ft from house |
| **58.15** | CRITICAL | Property center |
| **58.45–58.75** | CRITICAL — house floor | House floor level |

**2018 peak (family):** 52.61 ft (3 Mar 2018) — still below dock bank-full; road to yard/church passable.

---

## 3. Monitoring stations (family network)

| Station | River | Role |
|---|---|---|
| **J.T. Myers L&D** | Ohio | Primary local — ~59 mi downstream of I-69 crossing |
| Shawneetown, IL | Ohio | Upstream leading indicator |
| New Harmony, IN | Wabash | Confluence input (USGS **03378500**) |
| Mt. Carmel, IL | Wabash | Lower Wabash |
| Evansville / Mt. Vernon | Ohio | Downstream / county seat |
| Dam 49 / Lawrenceville | Wabash | Lower Wabash control |

---

## 4. Historical & cultural (Posey / Point Township)

| Item | Fact |
|---|---|
| County formed | Sep 1814 (Gibson/Warrick); bounds fixed Dec 1818 |
| Point Township | Daniel Twp 14 Aug 1821 → renamed Point 13 May 1822 |
| First European settler (county) | Thomas Jones trading post **1790** |
| First permanent / namesake | John Daniel |
| Confluence | Wabash + Ohio — lowest SW corner of Indiana |
| Archaeology | Murphy, Ashworth sites; Hovey Lake Caborn-Welborn (NRHP) |
| African American settlement | Half Moon Pond — Carter, Odem, Spottsville |
| Nickname | “Hoop-Pole Township” (19th c. river lore) |
| Family lines | Tucker (paternal), Yeida/Mercer/Robinson (maternal), Robb (spouse) |
| Cemetery | Weiss / Zoar Church — Yeida–Mercer–Hughes network |

**Basin floods (context):** 1937 (record Ohio), 1913, 2008 (Point Township farmland/roads), 2011 (family daily Myers/Shawneetown/New Harmony series), 2018 (peak 52.61 ft family).

---

## 5. Material Truth alignment (LOMA)

From Material Truth Framework / LOMA checklist (NAVD88):

| Metric | ft NAVD88 |
|---|---|
| BFE | **375.0** |
| LAG | **377.2** |
| FFE | **382.5** |
| Clearance | **+2.2** (LAG − BFE) |

Pure LOMA path: natural ground, no structural fill under footprint; datum NAVD88 only.

Hydro parameters (Archimedes / IDNR style): Manning \(n=0.045\) floodplain; slope \(0.00015\); compensatory \(k=1.20\); primary gage **03378500**.

---

## 6. PTDT integration

| Family / agency input | System layer |
|---|---|
| Myers stage + trigger table | Operational state machine / HUD |
| 1949–1983 crests, 2011 daily, 2018 series | Calibration & historical scenario plates |
| USGS FIM (New Harmony / Vincennes) | Presentation inundation |
| LAG/BFE/FFE NAVD88 | LOMA + freeboard authority |
| 1.20× cut/fill | No-Rise / 312 IAC 10-5 |

Presentation never overwrites sealed BFE or family trigger semantics.

---

## Related

- `docs/ptdt-v33/BERM_PLACEMENT_AND_HISTORICAL_FLOOD.md`
- `docs/ptdt-v33/TRI_STATE_AGENCY_DATA_VERIFICATION.md`
- `docs/ptdt-v33/ENGINEERING_INVARIANTS.md`
- `backend/hydraulic/vertical_datum.py`
