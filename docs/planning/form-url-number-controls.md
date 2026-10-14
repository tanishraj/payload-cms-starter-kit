# URL and Number form controls

This is the first bounded milestone-3 catalogue increment. General/Lead Forms used by Generic Form and Contact Cards & Form now support eight controls: Text, Email, Phone, URL, Number, Textarea, Select and Checkbox. Other initial controls, private uploads and broad forms acceptance remain tracked and open.

## Editor flow

Add a native question row, choose URL or Number, and enter your own label/name, optional help, placeholder, required state and initial answer. Native preview uses the same presentation with submissions disabled. Fixed Review Submission does not render these controls: its publication validation tells editors to change intent or select a supported review control.

URL accepts a full HTTP/HTTPS address up to 2,048 characters. Relative addresses, other protocols, internal whitespace/backslashes/control characters and embedded username/password are rejected. Surrounding whitespace is trimmed. No URL is fetched or turned into an automatic link; original readable text is captured. Localhost/intranet addresses are allowed because intake is not a fetch authorization boundary.

Number accepts decimal text up to 64 characters, including negative values, leading plus signs and leading zeros. Use a dot for fractions, such as 1.5 or .5. Commas, scientific notation, non-finite tokens, hexadecimal notation and incomplete entries are rejected with an example. Optional blank answers stay blank. Ordinary JSON number values are not coerced into answers: API clients submit decimal strings, preserving precision and formatting.

Number exposes optional inclusive Minimum value and Maximum value, and an optional positive Allowed increment. Minimum cannot exceed maximum. An increment of 1 restricts answers to whole numbers when its base is an integer; 0.5 permits halves. The increment starts at the minimum, or zero if no minimum is set. Leave it blank for any decimal. Configuration values must be finite; whole-number settings must stay within ±9,007,199,254,740,991. Native configuration uses Payload’s number fields; submitted answers remain text. Numeric settings stay stored but inactive when changing to another control type.

Initial answers must satisfy the selected control’s validation. They initialize new responses only; omitted answers are never supplied by server intake or changed-form recovery. Editors retain the existing question-identity/name guidance and native relationship-drawer workflow.

## Shared presentation, validation and history

Both controls reuse the authenticated `@shadcnblocks/form-form-patterns-4` composition and its installed Radix Luma Input dependency, also used inside authenticated `@shadcnblocks/contact6`. No new component, layout, palette or form stylesheet is introduced. URL uses a URL input. Number uses the existing text Input with decimal input mode, so invalid/incomplete entries remain visible for correction instead of being silently emptied or rounded by a browser number input. Labels, help/error association, focus, pending, disabled preview, confirmation and retry behavior remain shared.

The same explicit type options, active-setting projection and validator serve native authoring, public/preview consumers and server intake. `formNumber.ts` contains bounded decimal comparison and increment checking with scaled integer arithmetic; it does not serialize BigInt or evaluate executable rules. Its callers enforce the existing field/body limits. URL and Number answers stay strings inside the existing immutable raw-value envelopes, with their semantic field type and exact readable value. Email notifications keep their existing escaped plain rendering for these values.

Active numeric settings enter published snapshots/fingerprints. Changing a range or increment triggers revision recovery before storage or notifications. Recovery retains only still-valid same-ID/type answers, explains incompatible clearing and requires review/resubmission. It never refills cleared questions from the new initial answer. Existing six-control schemas keep their prior hashes and behavior; there is no backfill or migration.

## Evidence and status

Branch: `feat/form-url-number-controls`, created from merged develop before implementation. Storybook-first URL And Number playground and validation play import the production presentation. Desktop, 390px and existing dark-theme review passes; interaction checks cover invalid URL/step blocking, focus, corrected answers and confirmation. Finish disposition: ship this bounded control presentation without restyling. This is not a new general accessibility certification; earlier workshop contrast qualifications remain.

Focused tests cover URL formats/caps/defaults, exact decimal boundaries/steps/precision, invalid rules/answers, both layouts, sanitized projection, fixed-review rejection and typed historical values. Native journeys, full regression/build/generators/security/context gates and commit/PR evidence are recorded in the implementation checklist after execution. No environment variables, dependencies or production data workflows added.
