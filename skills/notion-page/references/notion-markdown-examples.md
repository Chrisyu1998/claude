# Notion Markdown Quick Reference

This file contains exact syntax examples for the Notion-flavored Markdown features used in the travel template.

## Columns

```markdown
<columns>
	<column>
		Content for left column
	</column>
	<column>
		Content for right column
	</column>
</columns>
```

## Callouts

```markdown
::: callout {color="gray_bg"}
	## Heading
	Content inside callout
:::
```

## Table of Contents

```markdown
<table_of_contents color="gray"/>
```

## Date Mentions

```markdown
<mention-date start="2026-04-26" end="2026-05-02"/>
```

For a single date:
```markdown
<mention-date start="2026-04-26"/>
```

## Inline Databases

After creating a database with `notion-create-database`, reference it in page content:

```markdown
<database url="https://www.notion.so/[database-id]" inline="true" data-source-url="collection://[data-source-id]">db_name</database>
```

## Checkboxes

```markdown
- [ ] Unchecked item
- [x] Checked item
```

## Horizontal Rules (inside callouts)

```markdown
---
```

## Empty Blocks

```markdown
<empty-block/>
```

## Bold Text

```markdown
**Bold text**
```
