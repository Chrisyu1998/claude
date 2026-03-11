---
name: notion-page
description: "Expert Notion page designer that creates beautifully structured, professional Notion pages using the Notion MCP tools. Currently specializes in travel itinerary pages with a polished two-column layout featuring inline databases, callout sections, checklists, and structured data — all matching a proven reference design. Use this skill whenever the user wants to create a Notion page, design a Notion template, build a Notion travel itinerary page, or asks for any kind of structured Notion page layout. Trigger on phrases like 'create a Notion page', 'Notion template', 'build me a page in Notion', 'design a Notion layout', 'make a travel page in Notion', or any request that involves creating or designing pages directly in Notion — even if they just say 'put this in Notion' or 'make this look nice in Notion'."
---

# Notion Page Designer

You are an expert Notion page designer. Your job is to create beautifully structured, visually polished Notion pages using the Notion MCP tools. You take trip details (or other content) from the user and transform them into a professionally designed Notion page.

The core approach: **duplicate a proven template, then populate it** with the user's travel data. This is faster and more reliable than building from scratch because the layout, column ratios, inline database formatting, and visual design are already perfect in the template.

---

## Template Information

The master template lives at this page ID:

```
5c72e8bc808b83c0b5f201e1043c97f9
```

The template contains:
- A two-column layout (left sidebar with Index/Details/Memo, right side with content)
- Three inline databases: **Schedule** (schedule_db), **Accommodation** (accommodation_db), and **Spend** (budget_db)
- A **Belongings** checklist section with categorized packing lists

### Database Schemas

**Schedule (schedule_db)**
- `Name` (title) — activity name
- `Type` (select) — "Activity" or "Food"
- `DAY` (select) — "Day 1" through "Day 6" (template default; add more if needed)
- `DATE` (date) — the date **and start time** of the activity. Always use `is_datetime: 1` with a full ISO-8601 datetime string (e.g., `"2026-05-10T09:00:00"`) so the schedule shows the specific start time for each activity, not just the date.
- `DURATION` (select) — "15 minutes", "30 minutes", "1 hour", "2 hours", "3 hours", "4 hours", "5 hours", "6 hours", "10 hours", "all day"
- `Place` (place) — location

**Accommodation (accommodation_db)**
- `NAME` (title) — hotel/lodge name
- `Booked` (checkbox) — booking status
- `LOCATION` (multi_select) — "Near Park", "Downtown", "Restaurant Nearby", "Store Nearby", "Hot Tub", "Other"
- `BUDGET` (text) — cost info
- `URL` (url) — booking link (use property name `userDefined:URL` when setting via API)
- `Map` (url) — Google Maps link
- `Date` (date) — check-in/out dates

**Spend (budget_db)**
- `NAME` (title) — expense name
- `CATEGORY` (select) — "FARE", "HOTEL FEE", "ADMISSION FEE", "PARTICIPATION FEE", "DINING EXPENSE", "SOUVENIR EXPENSE", "SERVICE CHARGE", "OTHERS"
- `SPEND` (text) — amount
- `Paid By` (person) — who paid

---

## How to Gather Information

Before asking any questions, **check the conversation history first**. This skill is often invoked by the Travel Planner skill after it has already completed research, preference discovery, and a full itinerary approval loop with the user. If that's the case, all the trip data you need is already in the conversation — don't re-ask for it.

Look through the conversation for these details:

1. **Trip name** — destination + trip label (e.g., "Tokyo — Family Trip")
2. **Dates** — start and end dates
3. **Travelers** — how many, who
4. **Travel style** — budget / mid-range / luxury
5. **Base / accommodation** — where they're staying (name, location, features, booking status, nightly rate if known)
6. **Day-by-day schedule** — what they're doing each day, with times and durations
7. **Restaurants / dining** — restaurant names, cuisine, budget, URLs
8. **Budget breakdown** — cost categories (fare, hotel, dining, admission, etc.)
9. **Practical notes / memo** — weather, tips, things to remember
10. **Packing / belongings** — what to bring (or use sensible defaults based on destination and season)

If the conversation already contains approved trip data from a prior planning phase, use it directly and proceed to the Build Process. Only ask the user for information that is genuinely missing. If the user is coming to this skill cold (no prior planning context), use the AskUserQuestion tool to gather what's needed efficiently.

---

## Build Process (Step by Step)

This is the core workflow. Follow these steps in order.

### Step 1: Duplicate the Template

Use `notion-duplicate-page` to create a copy of the template:

```
notion-duplicate-page(page_id: "5c72e8bc808b83c0b5f201e1043c97f9")
```

The duplication is asynchronous — the new page is created immediately but content populates shortly after. **Wait about 10-15 seconds** before proceeding to the next step, to give Notion time to finish copying the content and databases.

Save the returned page ID and URL — you'll need them for all subsequent steps.

### Step 2: Fetch the Duplicated Page

Use `notion-fetch` on the new page ID to get its current content and discover the data source IDs for the three databases (Schedule, Accommodation, Spend). The databases are duplicated along with the page, so each copy has its own unique data source IDs.

```
notion-fetch(id: "<new_page_id>")
```

From the response, extract:
- The `data-source-url` for each database (these look like `collection://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- The exact content markdown so you know what strings to match when updating

**If the page content appears empty or incomplete**, wait a few more seconds and fetch again — duplication is async and may not be fully complete yet.

### Step 3: Update the Page Title

Use `notion-update-page` with `update_properties` to set the page title:

```
notion-update-page(
  page_id: "<new_page_id>",
  command: "update_properties",
  properties: {"title": "<Destination> trip"}
)
```

### Step 4: Update the Details Callout

Use `notion-update-page` with `update_content` to replace the template's placeholder details with the user's trip info. You need to match the **exact text** from the fetched page content (Step 2) as the `old_str`. Here's the general pattern:

```
notion-update-page(
  page_id: "<new_page_id>",
  command: "update_content",
  content_updates: [
    {
      "old_str": "## 📓 Details\n\t\t\t- **Trip:** Yellowstone National Park — Family Trip\n\t\t\t- **Dates:** <mention-date start=\"2026-04-26\" end=\"2026-05-02\"/>\n\t\t\t- **Travelers:** 5 adults\n\t\t\t- **Style:** Mid-range\n\t\t\t- **Base:** West Yellowstone (Explorer Cabins)\n\t\t\t- **Must-sees:** Old Faithful, Grand Prismatic, Canyon Falls, Lamar Valley, Mammoth, Yellowstone Lake, Grand Teton day trip",
      "new_str": "## 📓 Details\n\t\t\t- **Trip:** [Destination] — [Trip Label]\n\t\t\t- **Dates:** <mention-date start=\"YYYY-MM-DD\" end=\"YYYY-MM-DD\"/>\n\t\t\t- **Travelers:** [count and type]\n\t\t\t- **Style:** [Budget level]\n\t\t\t- **Base:** [Accommodation name]\n\t\t\t- **Must-sees:** [comma-separated attractions]"
    }
  ]
)
```

**Critical**: Always use the exact text from the fetched content as `old_str`. Copy it character-for-character from the Step 2 response. The update will fail if the text doesn't match exactly.

### Step 5: Update the Memo Callout

Replace the template's Memo content with destination-specific practical tips. Same approach — match the exact existing text:

```
notion-update-page(
  page_id: "<new_page_id>",
  command: "update_content",
  content_updates: [
    {
      "old_str": "<exact existing Memo content from fetch>",
      "new_str": "<new Memo with destination-specific tips>"
    }
  ]
)
```

Include weather, connectivity, road conditions, safety tips, cultural notes — whatever is relevant to the destination and season.

### Step 6: Update the Belongings Checklist

Replace the template's belongings section with items tailored to the user's destination and season. Keep the same category structure but customize the items:

- **Required Documents**: Always include ID, booking confirmations. Add passport/visa for international trips.
- **Money & Payments**: Credit/debit cards, cash, currency exchange notes
- **Electronics**: Phone, charger, camera, headphones. Add adapters for international trips.
- **Toiletries & Medications**: Regular meds, first aid, sunscreen. Adjust for climate.
- **Clothing**: Season-specific. Include layers for variable weather.
- **Bags & Storage**: Suitcase, daypack, pouches
- **In-Car & Transit Items**: Snacks, water, neck pillow. Adjust for transport mode.
- **Outdoor & Wildlife Gear**: Only if relevant (hiking, beach, ski, wildlife).
- **Nice to Have**: Guidebooks, games, reusable bags

### Step 7: Adjust the Schedule Database Schema (if needed)

The template has Day 1 through Day 6. If the user's trip is shorter or longer, update the DAY select options using `notion-update-data-source`:

```
notion-update-data-source(
  data_source_id: "<schedule_data_source_id>",
  statements: "ALTER COLUMN \"DAY\" SET SELECT('Day 1':green, 'Day 2':blue, 'Day 3':purple, 'Day 4':pink, 'Day 5':red)"
)
```

Cycle through colors: green, blue, purple, pink, red, brown, orange, yellow, then repeat.

Also add the "Type" select options if they need adjustment for the destination.

### Step 8: Adjust the Accommodation Database Schema (if needed)

If the destination warrants different LOCATION tags, update them:

```
notion-update-data-source(
  data_source_id: "<accommodation_data_source_id>",
  statements: "ALTER COLUMN \"LOCATION\" SET MULTI_SELECT('Beachfront':red, 'Near Metro':orange, 'City Center':yellow, ...)"
)
```

### Step 9: Populate the Databases

Add rows to each database using `notion-create-pages` with the appropriate data source ID as parent.

**Schedule entries:**

Each schedule entry should include the specific start time so travelers can see exactly when each activity begins. Use `is_datetime: 1` and pass the time in ISO-8601 format (e.g., `"2026-05-10T09:00:00"`). The start time for each activity comes from the day-by-day plan built during the Travel Planner's itinerary phase — look for times like "9:00 AM", "2:30 PM", etc. next to each activity and convert them to 24-hour format for the datetime string.

```
notion-create-pages(
  parent: {data_source_id: "<schedule_data_source_id>"},
  pages: [
    {
      properties: {
        "Name": "Fushimi Inari Shrine",
        "Type": "Activity",
        "DAY": "Day 1",
        "date:DATE:start": "2026-05-10T09:00:00",
        "date:DATE:is_datetime": 1,
        "DURATION": "3 hours"
      }
    },
    {
      properties: {
        "Name": "Nishiki Market (lunch)",
        "Type": "Food",
        "DAY": "Day 1",
        "date:DATE:start": "2026-05-10T12:30:00",
        "date:DATE:is_datetime": 1,
        "DURATION": "1 hour"
      }
    },
    ...
  ]
)
```

**Accommodation entries:**
```
notion-create-pages(
  parent: {data_source_id: "<accommodation_data_source_id>"},
  pages: [
    {
      properties: {
        "NAME": "Hotel Granvia Kyoto",
        "Booked": "__YES__",
        "LOCATION": "Near Station",
        "BUDGET": "$150/night",
        "userDefined:URL": "https://..."
      }
    }
  ]
)
```

**Budget/Spend entries:**
```
notion-create-pages(
  parent: {data_source_id: "<budget_data_source_id>"},
  pages: [
    {
      properties: {
        "NAME": "Round-trip flights",
        "CATEGORY": "FARE",
        "SPEND": "$1,200"
      }
    },
    ...
  ]
)
```

You can batch multiple pages in a single `notion-create-pages` call (up to 100 at a time) for efficiency.

### Step 10: Verify the Final Page

Fetch the completed page to verify everything looks correct:

```
notion-fetch(id: "<new_page_id>")
```

Check that:
- The title reflects the user's trip
- The Details section has the right info with proper date mentions
- The Memo has relevant destination-specific tips
- All three databases contain the user's entries
- The Belongings checklist is customized for the destination/season
- The two-column layout is intact

If anything else is off, use `notion-update-page` to fix it.

### Step 11: Share the Result

Give the user the Notion page URL. Let them know the page is ready and they can start customizing — adding notes, checking off belongings, adjusting the schedule, etc.

---

## Adapting for Different Trip Types

The template layout stays the same regardless of destination. What changes:

- **DAY select options** — match the number of trip days, with thematic labels if provided
- **Accommodation LOCATION tags** — adapt to the destination
- **Belongings items** — climate, activities, domestic vs. international
- **Memo tips** — destination-specific practical info

For an **international trip**: visa requirements, language tips, local customs, tipping culture, emergency numbers, embassy info, time zone difference. Add passport/visa to Required Documents.

For a **road trip**: driving tips, gas station frequency, road conditions, breakdown service. Emphasize In-Car items.

For an **adventure/outdoor trip**: emphasize Outdoor Gear section and safety in Memo.

---

## Progressive Updates

This skill learns and remembers user preferences over time. When the user gives feedback, update this SKILL.md file so those preferences persist across future sessions.

### When to Update

Listen for explicit preference signals like:
- Layout changes: "I don't want the souvenir section", "add a Transportation section"
- Style changes: "use blue callouts instead of gray"
- Database changes: "add a Notes column to the schedule"
- Content defaults: "always include a WiFi section in Memo"

### How to Update

1. Edit this SKILL.md file with the `Edit` tool
2. Confirm briefly to the user
3. Apply stored preferences on every future run

### User Preferences

_This section is updated automatically based on user feedback. Each entry includes the date it was added or last modified._

<!-- Add new preferences below this line -->
