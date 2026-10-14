# Session 6 — Corporate Financial Risk Management: Managing Interest Rate Risk

<div class="key"><b>Exam scope updated 14 October 2026.</b> The professor excludes money market hedge (p 88), currency swaps (pp 109 to 117), DCF valuation and guest speaker lectures from the half course exam and the Part I questions of the full exam. Other syllabus topics remain examinable. Source: Blackboard announcement "Exam content clarifications", 13 October 2026.</div>

By the end of this session you must be able to explain how a company's debt structure creates repricing and credit risk, compute the all-in cost (AIC) of a floating-rate loan by finding the IRR of its cash flows, name the three tools used to manage interest rate risk, work through a plain-vanilla interest rate swap (both the simple "net interest" version and the full loan-plus-swap cash flow table), explain a cross-currency swap with real numbers, and explain why a positive quality spread differential (QSD) is the condition that makes a swap worthwhile for both counterparties.

<div class="plan"><b>Plan</b><br/>1. Debt Financing: Debt vs Equity, and the Three Debt Strategies<br/>2. Pricing a Floating-Rate Loan: The All-in Cost (AIC)<br/>3. Three Tools for Managing Interest Rate Risk: Overview<br/>4. The Plain-Vanilla Interest Rate Swap, Step by Step<br/>5. Cross-Currency Interest Rate Swap: MedStat Example<br/>6. Case Study: MedStat's Floating-Rate Debt — When to Lock In a Swap<br/>7. Why Companies Actually Use Plain-Vanilla Swaps<br/>8. The Quality Spread Differential (QSD): Why Both Sides Gain<br/>9. Worked Recap Exercise: AIC and Swap Cash Flows<br/>10. Common Mistakes &amp; Exam Traps<br/>11. Must Know Absolutely</div>

## 1. Debt Financing: Debt vs Equity, and the Three Debt Strategies

- Before a firm can manage interest rate risk, it first has to choose how it finances itself. The slides frame this with a debt-vs-equity comparison, then a comparison of three different ways to structure debt itself.

<div class="def"><b>Debt vs Equity (Figure 7.1):</b> debt is a <b>fixed claim</b> — a fixed amount owed, on a fixed maturity — that is <b>tax deductible</b> (interest payments reduce taxable income), ranks with <b>high priority</b> if the firm gets into financial trouble, and gives the lender <b>no management control</b>. Equity is a <b>residual claim</b> — paid only after debt is paid — that is <b>not tax deductible</b>, ranks with the <b>lowest priority</b> in financial trouble, has <b>infinite</b> life (no fixed maturity), and gives the holder <b>management control</b>.</div>

- The slide sorts financing instruments into three buckets along this same spectrum:
- **Debt** (closest to the fixed-claim/high-priority end): bank debt, commercial paper, corporate bonds.
- **Hybrid securities** (in between): convertible debt, preferred stock, option-linked bonds.
- **Equity** (closest to the residual-claim/full-control end): owner's equity, venture capital, common stock, warrants.
- Within debt itself, a firm still has to choose **how** to structure it. The slides pose this as "Repricing vs Credit Risk," using three strategies a corporate borrower could use to raise the same $1 million for three years:
- **Strategy 1** — borrow $1 million for three years at a **fixed** rate of interest.
- **Strategy 2** — borrow $1 million for three years at a **floating rate** (SOFR, the Secured Overnight Financing Rate, + 2%), reset annually.
- **Strategy 3** — borrow $1 million for **one year** at a fixed rate, then renew (roll over) the credit annually.

<div class="def"><b>Add-on (repricing risk vs credit risk, not spelled out numerically on the slide but implied by the section title):</b> <b>repricing risk</b> is the risk that the interest rate you pay changes before the financing need is over — Strategy 1 has none (the rate is locked for the full 3 years), Strategy 2 has it every year (SOFR resets annually), and Strategy 3 has it every year too (a brand-new fixed rate is negotiated at each renewal). <b>Credit risk</b> here is the risk that the lender reprices your <i>credit spread</i> (or refuses to renew at all) based on your creditworthiness at the time — Strategy 3 is most exposed to this, since the whole loan (rate <i>and</i> terms) is renegotiated from scratch every year, whereas Strategy 1 locks in both the rate and the relationship for the full period.</div>

- This trade-off — lock in certainty now (Strategy 1) vs. stay exposed to the market and to your own credit standing (Strategies 2 and 3) — is the same trade-off that interest rate swaps exist to manage (Sections 3-4 below).

<div class="example"><b>US Corporate Credit Spreads (Exhibit 8.5):</b> the slide's chart shows that credit spreads (the extra yield lenders demand over Treasuries) rise with maturity and rise sharply as credit quality falls below investment grade. At the 5-year point specifically, the chart marks three gaps between rating bands: <b>155 basis points</b> between the B and BB curves, <b>232 basis points</b> between BB and (BBB/A/AA/AAA), and <b>188 basis points</b> shown as a further breakdown near the CCC/B area. Investment-grade borrowers (BBB and above) pay only slightly more than the Treasury curve; once a borrower falls into "speculative grade" (below BBB), the spread — and the cost of debt — rises dramatically.</div>

<div class="watch"><b>Watch out:</b> Exhibit 8.5's exact placement of the 155 bp/232 bp/188 bp brackets on the chart is visually dense (several curves overlap near the bottom of the chart) — treat the headline takeaway (spreads rise with maturity, and jump sharply below investment grade) as the exam-relevant point rather than memorizing the three basis-point figures individually.</div>

## 2. Pricing a Floating-Rate Loan: The All-in Cost (AIC)

<div class="def"><b>All-in cost (AIC), also called IRR here:</b> the true effective annual cost of a loan once every cash flow is accounted for — not just the quoted interest rate, but also the up-front fee (which reduces what the borrower actually receives) and the timing of every payment. It is found by computing the <b>internal rate of return (IRR)</b> of the loan's full cash flow stream.</div>

- Inputs needed to price a floating-rate loan, exactly as the slide sets them up:
  - **Notional amount of debt** — the loan's face value.
  - **Maturity** — how many years the loan runs.
  - **Reference rate** — the floating benchmark (SOFR in these slides).
  - **Credit spread (fixed)** — the fixed margin added on top of the reference rate; together, reference rate + credit spread = the **total interest payable**, sometimes labelled **Kd** (cost of debt).
  - **Up-front fee** — a percentage of the notional paid at inception, which **reduces** the cash the borrower actually receives ("loan proceeds") without reducing what must eventually be repaid.

<div class="formula">Loan proceeds = Notional &minus; (Up-front fee % &times; Notional)</div>

where:
- Notional is the face amount of the loan (what has to be repaid at maturity).
- Up-front fee % is the origination fee quoted as a percentage of that notional.
- What this does: it tells you how much cash actually lands in the borrower's account on day one — always less than the notional, because the fee is taken off the top.

<div class="formula">Interest cash flow (per year) = &minus;(Reference rate + Credit spread) &times; Notional</div>

where:
- Reference rate is the floating benchmark for that year (SOFR here); Credit spread is the fixed margin.
- What this does: each year, the borrower pays out interest equal to the full "all-in" rate (reference + spread) applied to the notional — a negative cash flow from the borrower's point of view. In the final year, the notional itself is also repaid, so that year's cash flow is interest **plus** principal.

<div class="example"><b>Worked example from the slides — 3-year floating-rate loan:</b> stated inputs are notional $10,000,000, maturity 3 years, reference rate SOFR (floating), credit spread 1.5% (fixed), up-front fee 1.5% of notional, current SOFR 5%. The slide's own computation table, however, is entirely self-consistent around a <b>$8,000,000</b> notional (every number in the table below reconciles exactly to $8,000,000, not $10,000,000 — see the Watch Out below).<br/><br/>Using SOFR held flat at 5% for all 3 years (the table's own assumption) and total interest payable Kd = 5.00% + 1.50% = <b>6.50%</b>:<br/>&bull; Origination fee = 1.5% &times; $8,000,000 = <b>&minus;$120,000</b>.<br/>&bull; Loan proceeds = $8,000,000 &minus; $120,000 = <b>$7,880,000</b> (Year 0 cash flow, positive for the borrower).<br/>&bull; Interest cash flow, Years 1-2: SOFR component &minus;$400,000 (5%&times;8 m) + credit spread component &minus;$120,000 (1.5%&times;8 m) = <b>&minus;$520,000</b> each year.<br/>&bull; Year 3: the same &minus;$520,000 interest, <i>plus</i> repayment of the $8,000,000 principal &rarr; total Year 3 cash flow = <b>&minus;$8,520,000</b>.<br/>&bull; Full cash flow stream: +$7,880,000 (Y 0), &minus;$520,000 (Y 1), &minus;$520,000 (Y 2), &minus;$8,520,000 (Y 3).<br/>&bull; Solving for the IRR of this stream gives the <b>all-in cost: AIC &asymp; 7.072%</b> — meaningfully above the quoted 6.50% rate, because the up-front fee makes the true cost of borrowing higher than the stated interest rate alone.</div>

- What this actually does, step by step: (1) lay out every cash flow the borrower actually pays or receives, year by year, including the fee at time 0 and the principal repayment in the final year; (2) find the single discount rate that makes the present value of all those cash flows equal to zero (equivalently, that makes the Year-0 proceeds exactly balance the future outflows) — that rate is the AIC; (3) compare the AIC to the quoted interest rate (SOFR + spread) to see how much the fee alone adds to the true cost.

<div class="example"><b>Sensitivity to the floating rate (same loan):</b> the slide also shows how the AIC moves if SOFR itself drifts over the life of the loan, instead of staying flat at 5%.<br/>&bull; Base case (SOFR flat at 5.00% all 3 years): AIC = <b>7.072%</b>.<br/>&bull; Floating rate rises 25 bps per year (5.25% &rarr; 5.50% &rarr; 5.75%): AIC = <b>7.565%</b>.<br/>&bull; Floating rate falls 25 bps per year (4.75% &rarr; 4.50% &rarr; 4.25%): AIC = <b>6.578%</b>.<br/>This is exactly the repricing risk from Section 1, Strategy 2, made concrete: a floating-rate borrower's true cost moves with the reference rate, year by year.</div>

<div class="watch"><b>Watch out:</b> the slide's introductory text states the loan is <b>$10,000,000</b>, but its own computation table (origination fee, interest cash flows, AIC) is internally consistent only with an <b>$8,000,000</b> notional — likely a typo on the slide. Use the table's figures (the ones reproduced above) as authoritative if this exact example reappears, not the $10,000,000 figure from the intro line.</div>

## 3. Three Tools for Managing Interest Rate Risk: Overview

- Facing interest rate risk (whether from a floating-rate loan's repricing risk, or from wanting to change a fixed-rate loan's exposure), the slides name three tools:
- **Interest Rate Swap (IRS)** — the tool developed in depth in this session (Sections 4-5 below).
- **Forward Rate Agreement (FRA)** — named on the overview slide but not developed further in these slides.
- **Interest Rate Option** — likewise named but not developed further here.

<div class="def"><b>Interest rate swap, general definition:</b> in a swap, two counterparties agree to a contractual arrangement in which they exchange cash flows at periodic intervals. There are two types covered in this session:<br/>&bull; <b>Interest rate swap ("plain vanilla")</b> — a fixed-for-floating exchange, in a single currency.<br/>&bull; <b>Cross-currency interest rate swap</b> ("currency swap") — fixed-for-fixed rate debt service exchanged across two (or more) currencies, e.g. Swiss franc interest payments exchanged for US dollar interest payments.</div>

<div class="watch"><b>Watch out:</b> the FRA and Interest Rate Option boxes appear on the overview slide (Section 2 of the deck) alongside the Interest Rate Swap box, but no further slide in this deck defines or works through either one — only the interest rate swap (plain vanilla and cross-currency) is developed with examples. If FRAs or interest rate options come up on the exam, that content likely comes from a different session or the textbook chapter directly; it is not covered in this deck.</div>

## 4. The Plain-Vanilla Interest Rate Swap, Step by Step

### 4.1 The Simple Version: Turning a Floating-Rate Loan into a Fixed One

- Setup: **Firm A** has a floating-rate loan on which it pays **SOFR + 1.5%** to its lender. Firm A wants certainty, so it enters a **separate** agreement with a **Swap Bank**: Firm A pays the swap bank a **fixed 5.75%**, and in exchange receives **floating SOFR** from the swap bank.
- Tracing the cash flows for Firm A:
  - Pays SOFR + 1.5% to its original lender (the underlying loan, unchanged).
  - Pays 5.75% fixed to the swap bank.
  - Receives SOFR from the swap bank.
- The SOFR Firm A receives from the swap bank exactly offsets the SOFR it pays on its original loan — they cancel out, leaving Firm A with a fixed net cost.

<div class="formula">Net interest = 5.75% + SOFR + 1.5% &minus; SOFR = 5.75% + 1.5% = 7.25%</div>

where:
- 5.75% is the fixed rate Firm A pays the swap bank; SOFR + 1.5% is what Firm A still pays on its original floating loan; the second SOFR (subtracted) is what Firm A receives back from the swap bank.
- What this does: the two SOFR terms cancel algebraically, because Firm A pays SOFR on the loan and receives the identical SOFR from the swap bank at the same time. What's left is a flat, fixed rate — Firm A has converted a floating-rate loan into the economic equivalent of a fixed-rate loan at **7.25%**, without touching the original loan contract itself.

### 4.2 The Full Worked Example: Loan + Swap Combined Cash Flow Table

- The slides also work through a complete loan-plus-swap cash flow table (not just the net-rate shortcut above), for a **$10,000,000**, 3-year floating-rate loan with a **1.5%** credit spread, a **1.5%** origination fee, and SOFR starting at **5.00%**, where the borrower simultaneously pays fixed **5.75%** and receives floating SOFR on a swap.
- Per year (Years 1-3), all flows at 5.00% SOFR:
  - SOFR (floating) paid on the loan: **&minus;$500,000** (5.00% &times; $10 m).
  - Credit spread (fixed) paid on the loan: **&minus;$150,000** (1.50% &times; $10 m).
  - Pay fixed on the swap: **&minus;$575,000** (5.75% &times; $10 m).
  - Receive floating (SOFR) on the swap: **+$500,000** (5.00% &times; $10 m) — exactly cancels the SOFR paid on the loan.
  - **Total Interest Payable = &minus;$725,000** per year (the SOFR terms cancel, leaving the fixed 5.75% swap rate + the 1.50% credit spread = 7.25%, exactly matching the net-interest shortcut of Section 4.1).
- Principal side: loan principal $10,000,000; origination fee 1.5% = **&minus;$150,000**; loan proceeds = **$9,850,000** (Year 0); principal repayment of $10,000,000 falls in Year 3.
- Full cash flow stream: **+$9,850,000** (Y 0), **&minus;$725,000** (Y 1), **&minus;$725,000** (Y 2), **&minus;$10,725,000** (Y 3, interest + principal).
- Solving for the IRR of this stream gives **AIC &asymp; 7.830%** — again above the 7.25% net swap rate, because of the up-front fee (same mechanism as Section 2).

## 5. Currency swap: excluded from the exam

This source example is retained for context, not exam preparation. The exclusion does not cover the plain vanilla interest rate swap in Section 4.

- A **cross-currency (currency) swap** exchanges **fixed-for-fixed** payments in two different currencies, rather than fixed-for-floating in one currency.
- MedStat's currency swap: MedStat will **receive** a fixed **1.26%** on a **$10,000,000** US-dollar notional principal, while **paying** a fixed **1.15%** on a UK-pound notional principal.
- Converting the two notionals at the deal's spot exchange rate of **$1.56 = £1.00**: $10,000,000 &divide; 1.56 = **£6,410,256** — the two notional principals are economically equivalent at the spot rate on day one.
- Cash flows over the life of the swap (Years 1-3):
  - **USD side (MedStat receives):** $126,000 in Year 1 and Year 2 (1.26% &times; $10 m), and $10,126,000 in Year 3 (interest + the $10,000,000 principal returned).
  - **GBP side (MedStat pays):** £73,718 in Year 1 and Year 2 (1.15% &times; £6,410,256), and £6,483,974 in Year 3 (interest + the £6,410,256 principal).
- The slide notes the USD receive-fixed rate is the 3-year <b>bid</b> rate and the GBP pay-fixed rate is the 3-year <b>ask</b> rate from the (source textbook's) rate table — i.e. the swap bank quotes a bid/ask spread on each currency leg, same as any other market-making activity.

<div class="watch"><b>Watch out:</b> this MedStat currency-swap example (Section 5) and the MedStat floating-rate-debt case study (Section 6 below) are <b>two separate, unrelated worked examples</b> that happen to reuse the same company name from the source textbook — different notional amounts ($10 m here vs $40 m in Section 6), different swap type (cross-currency fixed-for-fixed here vs single-currency fixed-for-floating in Section 6), and different numbers throughout. Do not mix the two up.</div>

## 6. Case Study: MedStat's Floating-Rate Debt — When to Lock In a Swap

- **Setup:** MedStat has **$40 million** in floating-rate bank loans, paying **3-month LIBOR + 1.25%** (the 1.25% is MedStat's own company credit spread). Over the past year, LIBOR has been trending upward.
- MedStat is now considering swapping its floating-rate debt into fixed — a **pay-fixed, receive-floating** plain vanilla interest rate swap: it would pay a fixed rate and receive LIBOR from the swap bank, and that received LIBOR would offset the LIBOR it still owes on its underlying loan (same cancellation mechanism as Section 4.1).
- **At the "current point in time" (2017 Q 3):** the fixed rate available to MedStat on the swap is **3.850%**. If MedStat swaps now, its total locked-in cost = swap fixed rate (3.850%) + its own credit spread (1.25%) = **5.10%**, flat for the remaining life of the loan.
- **The cost of waiting:** the second exhibit shows that if MedStat delays and LIBOR keeps rising, the fixed rate quoted for the swap rises too — by **2017 Q 4**, the fixed rate available has moved up to **4.200%** (from 3.850% one quarter earlier). This illustrates the general point that **as short-term floating rates rise, the fixed rates quoted in the swap market rise with them** — waiting to lock in a swap is itself a bet that rates won't keep climbing.
- The broader lesson: once LIBOR is clearly trending upward and a company like MedStat has decided it wants certainty, delaying the swap decision doesn't avoid interest rate risk — it just exposes the company to the risk that the fixed rate on offer keeps getting worse while it waits.

## 7. Why Companies Actually Use Plain-Vanilla Swaps

- The slides group real-world swap usage into two categories:
- **Debt structure** — every company pursues a target mix of maturity, currency composition, and fixed/floating pricing; getting the fixed/floating mix right is one of the hardest parts of that target to hit directly through new borrowing alone. Companies with very high credit quality (single-A or AA names such as **Walmart** or **IBM**) have privileged access to fixed-rate debt markets, so they often raise large amounts of debt at fixed rates and then use the plain-vanilla swap market to convert a chosen portion of that fixed-rate debt into floating-rate debt — reaching their desired mix without having to issue floating-rate debt directly.
- **Debt cost** — firms are always looking for ways to lower their cost of debt, and the plain-vanilla swap market is one of the most accessible, low-cost ways to do it (this connects directly to the QSD mechanism in Section 8, which is exactly how a swap can lower cost for both sides at once).

## 8. The Quality Spread Differential (QSD): Why Both Sides Gain

<div class="def"><b>Quality Spread Differential (QSD):</b> the necessary condition for a fixed-for-floating swap to benefit both counterparties and the swap bank arranging it. It exists when the gap between two borrowers' fixed rates is different from the gap between their floating rates — that mismatch is the pool of savings the swap can split between the two sides (plus a cut for the swap bank).</div>

<div class="example"><b>Worked example (swap bank quoting a 5-year USD IRS at 10.375%-10.5% against 12-month SOFR + 0.72%):</b> two borrowers approach the swap bank — <b>Company B</b> and <b>Bank A</b>.<br/><table><tr><th></th><th>Company B</th><th>Bank A</th><th>Differential</th></tr><tr><td>Fixed-rate</td><td>11.25%</td><td>10.00%</td><td>1.25%</td></tr><tr><td>Floating-rate</td><td>SOFR + 1.22%</td><td>SOFR + 0.72%</td><td>0.50%</td></tr></table><br/>Company B pays 1.25 percentage points more than Bank A in the fixed-rate market, but only 0.50 percentage points more than Bank A in the floating-rate market — Company B's relative disadvantage is much bigger in fixed than in floating.</div>

<div class="formula">QSD = (Fixed-rate differential) &minus; (Floating-rate differential)</div>

where:
- Fixed-rate differential is the gap between the two borrowers' fixed borrowing costs; floating-rate differential is the gap between their floating borrowing costs.
- What this does, step by step: (1) find how much more (or less) each borrower pays than the other in the fixed-rate market; (2) find the same gap in the floating-rate market; (3) subtract the two gaps. In this example: 1.25% &minus; 0.50% = **QSD = 0.75%**. A <i>positive</i> QSD means there is a real difference in how the two borrowers are priced across the fixed and floating markets — and that difference is exactly the combined savings a swap can unlock, to be split between Company B, Bank A, and the swap bank arranging the deal.

- Intuition for why this happens: lenders in the fixed-rate (bond) market price in credit risk more heavily (a fixed-rate lender is exposed to that credit risk for the full life of the bond), while floating-rate lenders reprice the loan periodically and so care relatively less about a borrower's credit quality at the outset. A lower-rated borrower (here, Company B) is therefore penalized more heavily in the fixed market than in the floating market — which is exactly the gap the QSD captures.

## 9. Worked Recap Exercise: AIC and Swap Cash Flows

<div class="watch"><b>Watch out:</b> the slides state this exercise's questions but do not show a solved answer. The computation below applies the exact same method taught in Sections 2 and 4 (find the loan's cash flows, then solve for the IRR/AIC), using the exercise's own stated inputs — treat it as a worked practice solution built with the taught method, not a professor-confirmed answer key. Verify with an IRR function (e.g. Excel) if this exact exercise is graded.</div>

### 9.1 Part 1 — All-in Cost of the Floating-Rate Loan

- Given: notional $8,000,000; maturity 3 years; reference rate SOFR (floating); credit spread (fixed) 1.8%; up-front fee 2% of notional; current SOFR 4%.
- Applying Section 2's method, with SOFR held flat at 4% (same "base case" assumption used in the taught example):
  - Total interest payable (Kd) = SOFR (4%) + credit spread (1.8%) = **5.8%** per year.
  - Origination fee = 2% &times; $8,000,000 = **&minus;$160,000**.
  - Loan proceeds (Year 0) = $8,000,000 &minus; $160,000 = **+$7,840,000**.
  - Interest cash flow, Years 1-2 = &minus;5.8% &times; $8,000,000 = **&minus;$464,000** each year.
  - Year 3 = &minus;$464,000 interest &minus; $8,000,000 principal repayment = **&minus;$8,464,000**.
  - Full stream: +$7,840,000 (Y 0), &minus;$464,000 (Y 1), &minus;$464,000 (Y 2), &minus;$8,464,000 (Y 3).
- Solving for the IRR of this stream: **AIC &asymp; 6.55%** — again above the quoted 5.8% rate, because of the 2% up-front fee.

### 9.2 Part 2 — Swapping the Floating-Rate Loan into Fixed

- Given: the same $8,000,000 loan from Part 1, now paired with a swap where the firm pays fixed **4.5%** and receives floating SOFR.
- Applying Section 4's method: the SOFR the firm pays on the loan and the SOFR it receives from the swap cancel, leaving a fixed net rate of **swap fixed rate + credit spread = 4.5% + 1.8% = 6.3%** per year.
- Cash flow table, Years 1-3 (using SOFR = 4%, consistent with Part 1):
  - SOFR paid on loan: &minus;$320,000 (4% &times; $8 m).
  - Credit spread paid on loan: &minus;$144,000 (1.8% &times; $8 m).
  - Pay fixed on swap: &minus;$360,000 (4.5% &times; $8 m).
  - Receive floating (SOFR) on swap: +$320,000 (4% &times; $8 m) — cancels the loan's SOFR line.
  - **Total interest payable = &minus;$504,000** per year (matches 6.3% &times; $8 m directly).
- Full stream (loan proceeds unchanged from Part 1 at $7,840,000, since the 2% fee was on the loan, not the swap): +$7,840,000 (Y 0), &minus;$504,000 (Y 1), &minus;$504,000 (Y 2), &minus;$8,504,000 (Y 3, interest + principal).
- Solving for the IRR of this stream: **AIC &asymp; 7.06%** — this is the true all-in cost of the swapped (now-fixed) position, combining the loan's up-front fee with the swap's net fixed rate.

## 10. Common Mistakes & Exam Traps

- Quoting a loan's stated interest rate (reference rate + credit spread) as its true cost, and forgetting that the up-front fee pushes the actual AIC/IRR higher than the quoted rate.
- Forgetting to include the principal repayment in the final year's cash flow when computing AIC or a swap's combined cash flow table — the last year is always interest **plus** principal, not interest alone.
- Mixing up the two SOFR legs in a pay-fixed/receive-floating swap: the SOFR you pay on the underlying loan and the SOFR you receive from the swap bank must be at the **same** rate for them to cancel and leave a clean fixed rate — always check the two SOFR lines are at the same value before assuming they net to zero.
- Treating the fixed rate quoted for a swap as if it never changes — Section 6 shows it moves with the reference rate (3.850% at one point in time vs 4.200% one quarter later), so delaying a swap decision carries its own risk.
- Confusing a plain-vanilla interest rate swap (fixed-for-floating, one currency) with a cross-currency swap (fixed-for-fixed, two currencies) — they solve different problems and have entirely different cash flow structures.
- Computing the QSD with the differentials in the wrong order, or forgetting it must be **positive** for a swap to create shared value in the first place.
- Confusing debt's characteristics (fixed claim, tax deductible, high priority, no control) with equity's (residual claim, not tax deductible, lowest priority, full control) — they are exact opposites on every dimension listed in Figure 7.1.

## 11. Must Know Absolutely

<div class="key"><b>Must know:</b><br/>&bull; Debt = fixed claim, tax deductible, high priority, no control. Equity = residual claim, not tax deductible, lowest priority, full control.<br/>&bull; AIC (all-in cost) = the IRR of a loan's full cash flow stream (proceeds net of fee, then interest, then interest+principal in the final year) — always above the quoted rate because of the up-front fee.<br/>&bull; Three interest-rate-risk tools named in this deck: Interest Rate Swap (developed in depth), Forward Rate Agreement, Interest Rate Option (the latter two not developed further here).<br/>&bull; Plain-vanilla swap mechanism: pay fixed + receive floating on the swap, while still paying floating + spread on the underlying loan &rarr; the two floating legs cancel, leaving a fixed net rate = swap fixed rate + credit spread.<br/>&bull; Cross-currency swap = fixed-for-fixed payments exchanged across two currencies, notionals linked by the spot exchange rate at inception.<br/>&bull; QSD = (fixed-rate differential between two borrowers) &minus; (floating-rate differential between them); must be positive for a swap to create value split between both borrowers and the swap bank.<br/>&bull; Waiting to enter a swap is not risk-free — the fixed rate on offer moves with the reference rate over time.</div>

## Watch Out

<div class="watch"><b>Watch out:</b> the floating-rate loan example in Section 2 states a $10,000,000 notional in its intro text, but its own computation table is only internally consistent with an $8,000,000 notional — use the table's figures, not the $10,000,000 line, if this example reappears.</div>

<div class="watch"><b>Watch out:</b> the FRA and Interest Rate Option boxes named on the Section 3 overview slide are never developed with a definition or example anywhere in this deck — only the interest rate swap (plain vanilla and cross-currency) is actually taught here.</div>

<div class="watch"><b>Watch out:</b> Section 5 (MedStat currency swap, $10 m/&pound;6.41 m) and Section 6 (MedStat floating-rate debt case study, $40 m) are two unrelated worked examples that happen to share the source textbook's example company name — don't merge their numbers.</div>

<div class="watch"><b>Watch out:</b> the US Corporate Credit Spreads chart (Exhibit 8.5, Section 1) marks several overlapping basis-point gaps near the bottom of a dense curve chart; the individual 155 bp/232 bp/188 bp figures are reproduced as given but the chart's own visual layout made the exact curve-to-curve pairing hard to confirm with full certainty from the extracted image — the safe exam takeaway is the general shape (spreads widen with maturity and jump sharply below investment grade), not the individual numbers.</div>

<div class="watch"><b>Watch out:</b> Section 9's Recap Exercise has no solved answer in the extracted slides — the AIC figures given there (&asymp;6.55% and &asymp;7.06%) were computed independently using the same IRR method taught in Sections 2 and 4, not copied from a slide. Re-verify with a spreadsheet IRR function before relying on the exact decimal if this exercise is graded.</div>
