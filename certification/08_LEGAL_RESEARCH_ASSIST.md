# Legal research assist — NOT legal advice

Derived from patterns in public legal-AI tooling (Juris.AI-style assistants, statute-reading skills, lawyer disclaimer templates, RAG document Q&A). **This is not a law firm product and does not create an attorney–client relationship.**

## Useful patterns (from your screenshots)

| Source pattern | How we use it here |
|----------------|--------------------|
| Statute reading / applying guides | `certification/07_STATUTE_INDEX.md` + LOMA/IDNR checklists |
| Lawyer disclaimer templates | Section below — mandatory banner on any AI legal memo |
| Document upload + RAG Q&A | Optional offline index of *your* PDFs only (FEMA/IDNR checklists already in-repo) |
| Citation discipline / hallucination checks | Prefer primary cites (IC, 312 IAC, 44 CFR); never invent case names |
| kipi “Lawyer” persona | Draft compliance memos with **code citations**, still UNSIGNED |
| License audit skill | Apache-2.0 already on this repo; keep dependency license scan in CI later |

## Mandatory disclaimer (adapt from open lawyer_disclaimer patterns)

> This material is for informational and engineering-coordination purposes only.  
> It is **not legal advice**. Floodplain, insurance, and title outcomes depend on  
> licensed professionals. PE seals require an Indiana Professional Engineer (IC 25-31-1).  
> AI-generated text may contain errors; verify every citation against official sources.

## What AI legal tools cannot replace

- Indiana PE seal on No-Rise / elevation products  
- Licensed attorney advice on NFIP, title, or appeals  
- FEMA or IDNR official determinations  

## Suggested research prompts (for a human + PE/attorney)

1. Confirm FIRM panel **18129C0215D** effective date on FEMA MSC.  
2. Confirm BFE **375.0** NAVD88 via INFIP / FARA for the parcel.  
3. Confirm pure LOMA path requires **no fill** under structure.  
4. Map IC 14-28-1 drainage-area threshold to site watershed.
