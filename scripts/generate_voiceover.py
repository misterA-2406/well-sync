"""
WellSync Demo Video — Generate professional voiceover audio using Microsoft Edge TTS.
Produces segment audio files and a final merged voiceover track.
"""
import asyncio
import edge_tts
import os
import json
import subprocess
import sys

# High-quality Microsoft Edge TTS voice
# en-US-GuyNeural = warm, confident male voice (professional narrator)
VOICE = "en-US-GuyNeural"
RATE = "-4%"   # Slightly slower than default for clarity
PITCH = "+0Hz"

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "videos", "audio_segments")
FINAL_AUDIO = os.path.join(os.path.dirname(__file__), "..", "docs", "videos", "voiceover_full.mp3")
FFMPEG = os.path.join(os.path.dirname(__file__), "..", "node_modules", "ffmpeg-static", "ffmpeg.exe")

# Voiceover segments with timing gaps (silence in seconds between segments)
SEGMENTS = [
    {
        "id": "01_hook",
        "text": "Imagine you've walked eight thousand steps a day for two straight weeks. Then Ramadan begins. Or summer hits fifty degrees. Or you pull three consecutive night shifts at an Abu Dhabi hospital. Your fitness app resets your streak to zero. Fourteen days, erased. Psychologists call this the What-the-Hell Effect: one bad day feels like total failure, and people quit. WellSync was built to end that cycle.",
        "pause_after": 1.0
    },
    {
        "id": "02_tariq",
        "text": "This is Tariq, a nurse at an Abu Dhabi hospital. Over two weeks, he's built a healthy rhythm: eight thousand five hundred steps a day. Our deterministic engine, no AI, no cloud, no guesswork, learns his genuine baseline from his rolling twenty-eight-day median. So far, so good. But real life is about to intervene.",
        "pause_after": 1.5
    },
    {
        "id": "03_disruption",
        "text": "Day fifteen. A three-day night shift rotation begins. Tariq's steps drop to three thousand two hundred. In any conventional app, this is the end. Fourteen days of progress, gone. But watch what WellSync does. There are no red alarms. No guilt notifications. No reset to zero. Instead, the engine immediately steps Tariq's daily target down to the Minimum rung, exactly fifty percent of his baseline. This is Behavior Change Technique 8.7: Graded Tasks. We don't punish disruption. We adapt to it.",
        "pause_after": 1.0
    },
    {
        "id": "04_recovery",
        "text": "On the Recovery screen, Tariq picks a single micro-commitment: a ten-minute walk after his shift. Over three days, he hits his adapted minimum. And on day twenty-one, recovery is complete. His target is fully restored. All seventeen active days remain intact, nothing was erased. And his Return Count increments to one. That number is not a streak. It's proof of resilience.",
        "pause_after": 1.0
    },
    {
        "id": "05_evidence",
        "text": "Every claim we make is verifiable. We replayed our engine against seventy-one real participants and seven thousand four hundred forty-three days from the Nature LifeSnaps wearable dataset, peer-reviewed, open access, fully reproducible. The results: conventional streak resets collapsed an average of 17.9 times per user. Fixed ten-thousand-step goals labeled eighty-nine percent of days as failures. WellSync? Zero resets. Average recovery: 3.1 days.",
        "pause_after": 1.5
    },
    {
        "id": "06_arabic_privacy",
        "text": "And WellSync is built natively for Abu Dhabi: full Arabic localization, Ramadan and Summer Heat modes, and local-first privacy, zero network calls, zero cloud dependencies. Your health data never leaves your device.",
        "pause_after": 1.0
    },
    {
        "id": "07_close",
        "text": "Our path forward: a six-month pilot with three hundred SEHA healthcare workers, followed by Malaffi health information exchange integration and value-based insurance partnerships. WellSync is a student prototype built with conviction: that progress is not perfection, and recovery, is always easier than restarting. Thank you.",
        "pause_after": 3.0
    }
]


async def generate_segment(segment):
    """Generate a single audio segment."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, f"{segment['id']}.mp3")

    communicate = edge_tts.Communicate(
        text=segment["text"],
        voice=VOICE,
        rate=RATE,
        pitch=PITCH,
    )
    await communicate.save(output_path)
    print(f"  ✅ Generated: {segment['id']}.mp3")
    return output_path


def generate_silence(duration_seconds, output_path):
    """Generate a silence audio file using ffmpeg."""
    subprocess.run(
        [
            FFMPEG, "-y", "-f", "lavfi", "-i",
            f"anullsrc=r=24000:cl=mono",
            "-t", str(duration_seconds),
            "-c:a", "libmp3lame", "-q:a", "9",
            output_path
        ],
        capture_output=True, check=True
    )


def merge_segments():
    """Merge all segments with silence gaps into a single audio file."""
    # Build the concat list
    concat_list_path = os.path.join(OUTPUT_DIR, "concat_list.txt")
    files_to_concat = []

    for i, segment in enumerate(SEGMENTS):
        seg_path = os.path.join(OUTPUT_DIR, f"{segment['id']}.mp3")
        files_to_concat.append(seg_path)

        # Add silence gap after each segment
        if segment.get("pause_after", 0) > 0:
            silence_path = os.path.join(OUTPUT_DIR, f"silence_{i}.mp3")
            generate_silence(segment["pause_after"], silence_path)
            files_to_concat.append(silence_path)

    # Write concat list file (ffmpeg concat demuxer format)
    with open(concat_list_path, "w") as f:
        for fpath in files_to_concat:
            # Use forward slashes and escape single quotes
            safe_path = fpath.replace("\\", "/").replace("'", "'\\''")
            f.write(f"file '{safe_path}'\n")

    # Merge using ffmpeg concat demuxer
    os.makedirs(os.path.dirname(FINAL_AUDIO), exist_ok=True)
    subprocess.run(
        [
            FFMPEG, "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list_path,
            "-c:a", "libmp3lame", "-q:a", "2",
            FINAL_AUDIO
        ],
        capture_output=True, check=True
    )
    print(f"\n🎙️  Final voiceover saved: {FINAL_AUDIO}")

    # Print duration
    result = subprocess.run(
        [FFMPEG, "-i", FINAL_AUDIO, "-f", "null", "-"],
        capture_output=True, text=True
    )
    for line in result.stderr.split("\n"):
        if "Duration" in line:
            print(f"   {line.strip()}")
            break


async def main():
    print("🎙️  WellSync TTS Voiceover Generator")
    print(f"   Voice: {VOICE}")
    print(f"   Rate: {RATE}\n")

    # Generate all segments
    print("Generating voiceover segments...")
    for segment in SEGMENTS:
        await generate_segment(segment)

    # Merge into single file
    print("\nMerging segments into final voiceover track...")
    merge_segments()

    # Also export segment timing metadata for Playwright sync
    timings_path = os.path.join(OUTPUT_DIR, "segment_timings.json")
    # Get individual segment durations
    segment_data = []
    for segment in SEGMENTS:
        seg_path = os.path.join(OUTPUT_DIR, f"{segment['id']}.mp3")
        result = subprocess.run(
            [FFMPEG, "-i", seg_path, "-f", "null", "-"],
            capture_output=True, text=True
        )
        duration = 0
        for line in result.stderr.split("\n"):
            if "Duration" in line:
                # Parse "Duration: 00:00:25.12"
                parts = line.strip().split("Duration: ")[1].split(",")[0]
                h, m, s = parts.split(":")
                duration = float(h) * 3600 + float(m) * 60 + float(s)
                break
        segment_data.append({
            "id": segment["id"],
            "duration_seconds": round(duration, 2),
            "pause_after": segment.get("pause_after", 0),
            "total_with_pause": round(duration + segment.get("pause_after", 0), 2)
        })
        print(f"   {segment['id']}: {duration:.1f}s speech + {segment.get('pause_after', 0)}s pause")

    with open(timings_path, "w") as f:
        json.dump(segment_data, f, indent=2)
    print(f"\n📊 Timing metadata: {timings_path}")

    total = sum(s["total_with_pause"] for s in segment_data)
    print(f"\n⏱️  Total voiceover duration: {total:.1f}s ({total/60:.1f} min)")


if __name__ == "__main__":
    asyncio.run(main())
