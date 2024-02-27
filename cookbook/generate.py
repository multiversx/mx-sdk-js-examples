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

DIRECTIVE_PREFIX = "// md-"
DIRECTIVE_IGNORE = "// md-ignore"
DIRECTIVE_UNINDENT = "// md-unindent"
DIRECTIVE_AS_COMMENT = "// md-as-comment"
KNOWN_DIRECTIVES = [DIRECTIVE_IGNORE, DIRECTIVE_UNINDENT, DIRECTIVE_AS_COMMENT]


def main():
    for input_file in input_files:
        output_file = current_dir / "generated" / input_file.with_suffix(".md").name
        render_file(input_file, output_file)


def render_file(input_file: Path, output_file: Path):
    input_text = input_file.read_text()
    input_lines = input_text.splitlines()
    output_lines: List[str] = []

    for line in input_lines:
        assert_only_known_directives(line)

        should_ignore = DIRECTIVE_IGNORE in line
        should_unindent = DIRECTIVE_UNINDENT in line
        is_comment = line.startswith("//")
        should_keep_as_comment = DIRECTIVE_AS_COMMENT in line

        if should_ignore:
            continue

        if should_unindent:
            line = line.lstrip()

        if is_comment and not should_keep_as_comment:
            line = line[2:].lstrip()

        line = line.replace(DIRECTIVE_UNINDENT, "")
        line = line.replace(DIRECTIVE_AS_COMMENT, "")

        output_lines.append(line)

    output_text = "\n".join(output_lines)
    output_file.write_text(output_text)


def assert_only_known_directives(line: str):
    if DIRECTIVE_PREFIX not in line:
        return

    any_known_directive = any(
        directive in line for directive in KNOWN_DIRECTIVES)
    if any_known_directive:
        return

    raise Exception(f"Unknown directive in line: {line}")


if __name__ == "__main__":
    main()
