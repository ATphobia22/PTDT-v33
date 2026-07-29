# Regulatory math (Archimedes core)

Implemented in `archimedes_engine.py`.

## Manning open-channel velocity

US customary form used for floodplain depth estimate:

$$V = \frac{1.486}{n} R^{2/3} S^{1/2}$$

Project defaults:

- $n = 0.045$ (floodplain roughness)
- $S = 0.00015$ (energy slope)
- Hydraulic radius approximated by depth for simplified screening (full cross-section analysis still requires HEC-RAS / PE model)

## Compensatory storage

$$V_{\mathrm{fill}} = L \times W \times H$$
$$V_{\mathrm{cut}} = 1.20 \times V_{\mathrm{fill}}$$

Volumes reported in cubic yards ($\div 27$). Factor **1.20** is the project safety factor (not a substitute for site-specific IDNR direction). Older draft PDFs that used **1.15** are superseded by the engine constant `compensatory_safety_factor = 1.20`.

## Clearance vector

$$\Delta = \mathrm{LAG} - \mathrm{BFE}$$

With defaults $377.2 - 375.0 = +2.2$ ft on NAVD 88.
