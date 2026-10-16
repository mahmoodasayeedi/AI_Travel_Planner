
import json


MAX_HISTORY_MESSAGES = 12
RECENT_MESSAGES_TO_KEEP = 6


def summarize_conversation(
    client,
    model_name,
    old_messages,
    existing_summary="",
):
    """Summarize older messages using the configured model."""

    prompt = f"""
Update this conversation summary using the earlier summary
and the new older messages.

Previous summary:
{existing_summary or "No previous summary."}

Messages to incorporate:
{json.dumps(old_messages, ensure_ascii=False, indent=2)}

Preserve destinations, dates, duration, travellers, budget,
currency, interests, decisions, itinerary details, and unanswered
questions. Do not invent information. Return only the summary.
"""

    try:
        response = client.responses.create(
            model=model_name,
            instructions=(
                "You are a precise conversation summarizer. "
                "Preserve facts and important context."
            ),
            input=prompt,
        )

        return response.output_text.strip() or None

    except Exception as exc:
        print(f"Conversation summarization failed: {exc}")
        return None


def prepare_conversation(
    client,
    model_name,
    messages,
    existing_summary="",
    summarized_message_count=0,
):
    """Return API input, updated summary, and updated message count."""

    updated_summary = existing_summary
    updated_count = summarized_message_count

    if len(messages) - updated_count > MAX_HISTORY_MESSAGES:
        end_index = len(messages) - RECENT_MESSAGES_TO_KEEP
        old_messages = messages[updated_count:end_index]

        if old_messages:
            summary = summarize_conversation(
                client,
                model_name,
                old_messages,
                updated_summary,
            )

            if summary:
                updated_summary = summary
                updated_count = end_index

    api_input = []

    if updated_summary:
        api_input.append({
            "role": "developer",
            "content": (
                "Earlier conversation summary:\n"
                + updated_summary
            ),
        })

    api_input.extend(messages[updated_count:])

    return api_input, updated_summary, updated_count
