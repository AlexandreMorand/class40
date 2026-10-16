# Paper LBO, step by step

Financial Management · Session 9 · Revised 16 October 2026

<div class="key"><b>The whole idea</b><br/>Buy a company using some equity and some debt. Use the company's cash to repay the debt. Sell the company. Repay the debt that remains. The investor keeps what is left.</div>

A leveraged buyout is an acquisition financed mostly with debt. The course calls it an LBO. The company being bought, not the investor's personal income, generates the cash that services this debt.

## One simple example for the whole calculation

The numbers below are an original teaching example. They use the method in the slides, not a second set of course data. All amounts are in millions of euros.

| What the question gives us | Assumption |
|:---|---:|
| Annual revenue, constant for five years | 500 |
| Operating margin before depreciation and amortisation | 20% |
| Annual depreciation and amortisation | 20 |
| Annual maintenance investment in fixed assets | 20 |
| Annual increase in net working capital | 0 |
| Purchase multiple and sale multiple | 10 times |
| Acquisition debt | 600 |
| Annual interest rate | 5% |
| Tax rate | 25% |
| Holding period | 5 years |

There is no existing debt, excess cash, transaction fee or minimum cash reserve. There is one loan. All cash left after interest, taxes and investment repays that loan at each year end. No dividend is paid during the five years.

## Step 1. Calculate the purchase price

First find operating earnings before interest, taxes, depreciation and amortisation. This is the measure labelled EBITDA in the slides.

<div class="formula">Operating earnings = 500 × 20% = <b>100</b><br/>Enterprise value at purchase = 100 × 10 = <b>1,000</b></div>

Enterprise value is the value of the whole business, before subtracting debt. With no existing debt or excess cash, the seller receives 1,000.

## Step 2. Calculate the investor's equity

The purchase costs 1,000. Lenders provide 600. The investor must provide the remaining 400.

<div class="formula">Initial equity investment = 1,000 − 600 = <b>400</b><br/>Check: debt 600 + equity 400 = purchase price 1,000</div>

If the question includes transaction fees or required cash, add them to the purchase cost before subtracting the new debt. If existing debt must be refinanced, include that repayment too. Never count the same existing debt twice.

<div class="foot">Slides 11, 15, 17, 18 and 35. Original explanation and example.</div>

<pdf:nextpage />

# Turn earnings into cash

## Step 3. Calculate year 1 cash available to repay debt

Earnings are not the same as cash. Interest and taxes must be paid. Fixed assets and working capital also use cash.

**1. Interest.** The loan starts at 600. Interest is 600 × 5% = **30**.

**2. Profit before tax.** Deduct depreciation and interest from operating earnings. The result is 100 − 20 − 30 = **50**.

**3. Cash taxes.** Taxes are 50 × 25% = **12.50**.

**4. Net income.** After tax, the accounting profit is 50 − 12.50 = **37.50**.

**5. Cash available.** Add back depreciation because it is not a cash payment. Subtract the actual investment and the increase in working capital.

<div class="formula">37.50 + 20 − 20 − 0 = <b>37.50 of cash</b></div>

The same calculation can start directly from operating earnings:

<div class="formula">100 − interest 30 − taxes 12.50<br/>− maintenance investment 20 − working capital increase 0<br/>= <b>37.50 available for debt repayment</b></div>

Do not deduct depreciation again in this second formula. It already affected the tax calculation. It is not a cash outflow.

## Step 4. Repay the debt and repeat each year

At the end of year 1, repay 37.50. Debt becomes 600 − 37.50 = **562.50**.

For year 2, interest is now 562.50 × 5% = **28.125**. Taxable profit is 100 − 20 − 28.125 = **51.875**. Taxes are 51.875 × 25% = **12.96875**. Cash for repayment is 100 − 28.125 − 12.96875 − 20 = **38.90625**. Closing debt is 562.50 − 38.90625 = **523.59375**.

Repeat exactly the same calculation for years 3, 4 and 5.

| Millions of euros | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|:---|---:|---:|---:|---:|---:|
| Opening debt | 600.00 | 562.50 | 523.59 | 483.23 | 441.35 |
| Interest at 5% | 30.00 | 28.13 | 26.18 | 24.16 | 22.07 |
| Profit before tax | 50.00 | 51.88 | 53.82 | 55.84 | 57.93 |
| Taxes at 25% | 12.50 | 12.97 | 13.46 | 13.96 | 14.48 |
| Cash for repayment | 37.50 | 38.91 | 40.37 | 41.88 | 43.45 |
| Closing debt | 562.50 | 523.59 | 483.23 | 441.35 | **397.90** |

<div class="key"><b>Why cash repayment increases</b><br/>Less debt means less interest next year. More cash is then left to repay debt. Revenue and operating earnings have not grown at all.</div>

Calculations retain full precision. The table rounds only the displayed results. For this paper example, interest uses opening debt. The slides' spreadsheet uses average debt instead, which creates a circular calculation. Use the convention stated in the question.

<div class="foot">Slides 37 to 43. All repayment in this example goes to the single loan.</div>

<pdf:nextpage />

# Sell the company and measure the return

## Step 5. Calculate the sale value

After five years, annual revenue is still 500 and the operating margin is still 20%. Operating earnings are therefore still **100**. The sale multiple is still 10 times.

<div class="formula">Enterprise value at sale = 100 × 10 = <b>1,000</b></div>

The business has the same value as at purchase. That does not mean the investor's equity has the same value, because part of the debt has been repaid.

## Step 6. Subtract the debt that remains

The buyer pays 1,000 for the business. The lenders are owed 397.90. The investor receives the remainder.

<div class="formula">Equity proceeds = 1,000 − 397.90 = <b>602.10</b><br/>Profit on the equity investment = 602.10 − 400<br/>= <b>202.10</b></div>

Subtract the debt outstanding at sale, not the original debt of 600. If cash has accumulated instead of being used for repayment, add that cash when moving from enterprise value to equity value. Do not also count it as debt already repaid.

## Step 7. Calculate both return measures

**Multiple on invested capital.** Divide the money received by the money invested. This says how many euros come back for each euro invested.

<div class="formula">602.10 ÷ 400 = <b>1.51 times</b></div>

**Internal rate of return.** With one initial investment, one final receipt and no interim dividends, take the fifth root of the investment multiple, then subtract one.

<div class="formula">(602.10 ÷ 400)<sup>1/5</sup> − 1 = <b>8.52% per year</b></div>

Check: 400 × (1 + 8.52%)<sup>5</sup> ≈ 602.10. The small difference comes from rounding the annual return. With interim dividends, use all dated cash flows. This simple root formula would no longer be sufficient.

## What caused the profit in this example?

The company did not grow. The sale multiple did not increase. Debt fell by 600 − 397.90 = **202.10**. That is exactly the increase in the investor's equity value.

<div class="key"><b>The paper LBO sequence</b><br/>Purchase value → initial equity → annual cash → remaining debt → sale value → equity proceeds → return.</div>

More generally, a higher operating profit or a higher sale multiple can increase the sale value. More initial debt reduces the equity invested but also increases interest and the risk of losing that equity. Borrowing by itself does not make the business more valuable.

<div class="foot">Slides 7, 13, 44 and 45. The course abbreviates the two return measures as MOIC and IRR.</div>

<pdf:nextpage />

# What changes in the full course model?

The calculation above is the core. The slides add several financing layers and more detailed forecasts. They do not change the purchase, cash, debt and sale logic.

## Several loans, one repayment order

A **revolving credit facility** is a credit line held in reserve for short term cash needs. It is undrawn at purchase in the slides' example.

**Term Loan A** is a secured loan with scheduled repayments. The slides illustrate annual repayment of about 20% of original principal. **Term Loan B** has smaller scheduled repayments, about 1% of original principal, with most principal due at maturity.

**Senior unsecured notes** rank below secured loans. **Subordinated notes** rank below senior notes. Their principal is normally due at maturity. They are not repaid automatically by the term loan cash sweep. Early redemption may involve a premium.

A **cash sweep** means using cash left after required debt repayments to repay additional loan principal. In the slides, required repayments come first, then additional repayment of Term Loan A, then Term Loan B. Do not subtract scheduled repayment twice.

## Read the actual slides' figures without mixing them with our example

The slides use thousands of dollars. Purchase operating earnings are **409.0**, and the purchase multiple is **8.5 times**. Purchase enterprise value is 409.0 × 8.5 = **3,476.5**. Fees of about **52.1** bring total funding needed to **3,528.6**.

Debt is **2,331.3** and investor equity is **1,197.3**. The debt comprises Term Loan B of **1,308.8**, senior notes of **613.5** and subordinated notes of **409.0**.

For 2026, the cash calculation is 409.0 − investment 125.0 − working capital increase 11.3 − interest 200.1 − taxes 17.0 = **55.6**. Taxes use profit after depreciation and interest, not operating earnings before depreciation.

Required loan repayment is about **13.1**. Additional repayment is 55.6 − 13.1 = **42.5**. Total repayment is 55.6, not 55.6 + 13.1. Term Loan B closes at 1,308.8 − 55.6 = **1,253.2**. The two notes remain unchanged.

By 2030, the slides report total debt of **1,668.8**, operating earnings of **445.9**, an investment multiple of about **1.8 times** and an annual return of about **12.1%** at an unchanged 8.5 times sale multiple. These source figures are rounded.

## Why does the spreadsheet need iteration?

The spreadsheet calculates interest on average opening and closing debt. Closing debt depends on repayment. Repayment depends on cash after interest. Interest therefore depends on itself through the debt calculation. Iterative calculation repeats the calculation until the numbers settle. Our opening debt convention avoids this loop for a paper exercise.

The slides' floating rate loan uses a reference interest rate plus a contractual margin, with a minimum reference rate. Do not confuse the illustrative pricing of generic financing layers with the rates actually used in this transaction.

<div class="foot">Slides 17, 35 to 44 and 48. This is a separate source example, not an assumption change in the paper exercise.</div>

<pdf:nextpage />

# The other ideas to know from Session 9

## Private equity and a suitable target

Private equity invests in companies outside public stock markets, usually with control and an eventual sale in mind. Investors called limited partners commit capital. Managers called general partners select and manage investments. The slides illustrate fund lives of 10 to 12 years, annual management fees of 1% to 2%, and carried interest of 20%, subject to a minimum investor return.

A good buyout target has predictable cash, defensible margins, manageable investment needs and management able to execute the plan. It may be undervalued, inefficient, lightly indebted or holding excess cash. Assets that can be sold can also support repayment. A company without reliable cash cannot safely carry acquisition debt.

The slides describe value from buying at an attractive price or selling at a higher multiple, operating improvements, and debt repayment. Interest deductibility can reduce taxes, while debt obligations can discipline management. These benefits do not remove financing risk.

## Choose a multiple that matches what you are valuing

| Multiple | What it measures |
|:---|:---|
| Enterprise value divided by operating earnings before depreciation and amortisation | The main buyout multiple. Does not directly capture investment needs. |
| Enterprise value divided by operating profit after depreciation | Useful when depreciation and asset intensity matter. |
| Equity price divided by net income | An equity measure affected by financing and accounting. |
| Enterprise value divided by revenue | Useful when profits are negative. Must consider margins. |
| Equity price divided by book equity | Often used for financial institutions. Depends on accounting. |

To apply a multiple, select comparable companies or transactions, calculate their multiples, take a suitable median or average, then multiply by the target's matching earnings or revenue. Match growth, margins, risk, business and definitions. Use the same historical or forecast period across the comparison.

Trading multiples price listed minority stakes. Transaction multiples price acquisitions and may include control and synergies. For transaction comparisons, also check buyer type, stake purchased, cash or shares, date and available financial data. The Bulgari and Whole Foods examples show why changing the comparison group can materially change the answer.

## Test the return and the financing risk

Paying less, selling at a higher multiple, faster revenue growth and a better margin generally improve returns. More borrowing can increase the equity return, but also the downside. An earlier sale increases annualised return only if the proceeds are otherwise unchanged. An earlier sale in the full model can produce a lower return because less debt has been repaid.

Check debt relative to operating earnings, ability to cover interest, and available cash plus undrawn credit. The slides show indicative limits of 6 times for net debt and 4 times for senior secured debt, and coverage benchmarks of 2 times for operating earnings divided by interest and 1.5 times after maintenance investment. These are illustrative credit benchmarks, not guarantees of safety.

Secured lenders rank before unsecured and subordinated lenders. Preferred equity ranks before common equity. Common equity absorbs losses first. Financing also depends on deal size, market conditions, execution speed and future investment needs.

Possible exits are sale to a company, sale to another fund or a stock market listing. Borrowing again to pay a dividend returns cash without a full sale.

<div class="foot">Original synthesis of course slides 4 to 16, 19 to 34 and 45 to 49. The optional capital structure reading remains optional. No official slides or questions reproduced.</div>
