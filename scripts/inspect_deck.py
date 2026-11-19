import pptx
from pptx.util import Inches

prs = pptx.Presentation(r"c:\Users\Alence\Downloads\Future HealthCare\WellSync_Future_Health_Submission_Pitch_Deck.pptx")
print(f"Total slides: {len(prs.slides)}, Dimensions: {prs.slide_width / Inches(1):.2f}\" x {prs.slide_height / Inches(1):.2f}\"\n")

for i, slide in enumerate(prs.slides):
    print(f"=== SLIDE {i+1} ===")
    for s_idx, s in enumerate(slide.shapes):
        t = s.top / Inches(1)
        h = s.height / Inches(1)
        b = t + h
        l = s.left / Inches(1)
        w = s.width / Inches(1)
        txt = ""
        if s.has_text_frame:
            txt = s.text_frame.text.strip().replace('\n', ' ')[:45]
        elif s.has_table:
            txt = f"TABLE {len(s.table.rows)}x{len(s.table.columns)}"
        else:
            txt = "IMAGE/MEDIA"
        print(f"  Shape {s_idx} ({s.name[:20]}): top={t:.2f}\", bottom={b:.2f}\", left={l:.2f}\", width={w:.2f}\" | {txt}")
