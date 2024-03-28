from pathlib import Path
from typing import Dict, List

current_dir = Path(__file__).parent.absolute()

input_files = [
    current_dir / "basic.js",
    current_dir / "broadcasting_transactions.js",
    current_dir / "transfers.js",
    current_dir / "handling_amounts.js",
    current_dir / "contracts_01_deployments.js",
    current_dir / "contracts_02_abi.js",
    current_dir / "contracts_03_queries.js",
    current_dir / "contracts_04_interactions.js",
    current_dir / "contracts_05_events.js",
    current_dir / "codec.js",
    current_dir / "signing.js"
]

MARKER_INSERT = "md-insert:"
DIRECTIVE_PREFIX = "// md-"
DIRECTIVE_IGNORE = "// md-ignore"
DIRECTIVE_UNINDENT = "// md-unindent"
DIRECTIVE_AS_COMMENT = "// md-as-comment"
DIRECTIVE_INSERT = f"// {MARKER_INSERT}"

notes: Dict[str, str] = {
    "transactionLegacyVsNext": """:::note
Since `sdk-core v13`, the `Transaction` class exhibits its state as public read-write properties. For example, you can access and set the `nonce` property, instead of using `getNonce` and `setNonce`.
:::""",

    "forSimplicityWeUseUserSigner": """:::important
For the sake of simplicity, in this section we'll use a `UserSigner` object to sign the transaction.
In real-world dApps, transactions are signed by end-users using their wallet, through a [signing provider](https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers).
:::
"""
}


def main():
    output_file = current_dir / "cookbook.md"
    output_sections: List[str] = []

    for input_file in input_files:
        lines = render_file(input_file)
        section = "\n".join(lines).strip()
        output_sections.append(section)

    output_text = "\n".join(output_sections) + "\n"
    output_file.write_text(output_text)


def render_file(input_file: Path) -> List[str]:
    input_text = input_file.read_text()
    input_lines = input_text.splitlines()
    output_lines: List[str] = []

    for line in input_lines:
        should_ignore = DIRECTIVE_IGNORE in line
        should_unindent = DIRECTIVE_UNINDENT in line
        is_comment = line.startswith("//")
        should_keep_as_comment = DIRECTIVE_AS_COMMENT in line
        should_insert = DIRECTIVE_INSERT in line

        if should_ignore:
            continue

        if should_unindent:
            line = line.lstrip()

        if is_comment and not should_keep_as_comment:
            line = line[2:].lstrip()

        line = line.replace(DIRECTIVE_UNINDENT, "")
        line = line.replace(DIRECTIVE_AS_COMMENT, "")

        if should_insert:
            box_name = line.replace(MARKER_INSERT, "").strip()
            box_content = notes[box_name]
            line = box_content

        output_lines.append(line)

    return output_lines


if __name__ == "__main__":
    main()
