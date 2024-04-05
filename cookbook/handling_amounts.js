// ## Formatting and parsing amounts

// :::note
// For formatting or parsing token amounts as numbers (with fixed number of decimals), please do not rely on `sdk-core`. Instead, use `sdk-dapp` (higher level) or `bignumber.js` (lower level).
// :::

// You can format amounts using `formatAmount` from `sdk-dapp`:

// ```
import { formatAmount } from "@multiversx/sdk-dapp/__commonjs/utils/operations/formatAmount.js"; // md-ignore (recommended import, without "__commonjs", is below)
// import { formatAmount } from '@multiversx/sdk-dapp/utils/operations';

console.log("Format using sdk-dapp:", formatAmount({
    input: "1500000000000000000",
    decimals: 18,
    digits: 4
}));
// ```

// Or directly using `bignumber.js`:

// ```
import BigNumber from "bignumber.js";

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

console.log("Format using bignumber.js:",new BigNumber("1500000000000000000").shiftedBy(-18).toFixed(4));
// ```

// You can parse amounts using `parseAmount` from `sdk-dapp`:

// ```
import { parseAmount } from "@multiversx/sdk-dapp/__commonjs/utils/operations/parseAmount.js"; // md-ignore (recommended import, without "__commonjs", is below)
// import { formatAmount } from '@multiversx/sdk-dapp/utils/operations';

console.log("Parse using sdk-dapp:", parseAmount("1.5", 18));
// ```

// Or directly using `bignumber.js`:

// ```
console.log("Parse using bignumber.js:", new BigNumber("1.5").shiftedBy(18).decimalPlaces(0).toFixed(0));
// ```
