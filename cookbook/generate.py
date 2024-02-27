from pathlib import Path
from typing import List

current_dir = Path(__file__).parent.absolute()

input_files = [
    current_dir / "basic.js",
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

notes = {
    "transactionLegacyVsNext": """:::note
Since `sdk-core v13`, the `Transaction` class is considered legacy. The alternative is `TransactionNext`. 
In a future major release (e.g. end of 2024), the legacy `Transaction` class will be dropped, and replaced by `TransactionNext`, 
which will also receive the short name, `Transaction`.
:::"""
}


def main():
    for input_file in input_files:
        output_file = current_dir / "generated" / input_file.with_suffix(".md").name
        render_file(input_file, output_file)


def render_file(input_file: Path, output_file: Path):
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

    output_text = "\n".join(output_lines)
    output_file.write_text(output_text)


if __name__ == "__main__":
    main()
