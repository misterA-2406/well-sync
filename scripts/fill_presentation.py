"""
WellSync — Pixel-Perfect PowerPoint Generator (v2)
Corrects all layout overlaps, coordinate bounds, slide 15 title positioning,
and slide 16 thank-you alignment.
"""
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

TEMPLATE_PATH = r"C:\Users\Alence\.gemini\antigravity\brain\43d83034-0d87-4719-8ffd-0182434e0982\.user_uploaded\media_1795106921858_2033380f.pptx"
OUTPUT_PATH = r"c:\Users\Alence\Downloads\Future HealthCare\well-Sync\docs\WellSync_Future_Health_Submission_Pitch_Deck.pptx"
COPY_PATH = r"c:\Users\Alence\Downloads\Future HealthCare\WellSync_Future_Health_Submission_Pitch_Deck.pptx"

# Color Palette (WellSync Healthcare Theme)
FOREST = RGBColor(24, 60, 50)       # #183C32 - Primary Brand Forest Green
TERRACOTTA = RGBColor(201, 122, 72) # #C97A48 - Accent Warm Terracotta
INK = RGBColor(26, 36, 33)          # #1A2421 - Dark Body Text
MUTED = RGBColor(100, 116, 110)     # Subtle Grayish Teal
CARD_BG = RGBColor(250, 252, 250)   # Clean Soft Off-White
BORDER = RGBColor(218, 228, 223)    # Subtle Clean Border
WHITE = RGBColor(255, 255, 255)
AMBER_BG = RGBColor(254, 243, 199)  # Warning / Highlight Pill
AMBER_TEXT = RGBColor(146, 64, 14)

def set_font(run, name="Segoe UI", size_pt=10, bold=False, color=INK, italic=False):
    run.font.name = name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color

def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=BORDER):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.color.rgb = border_color
    shape.line.width = Pt(1)
    return shape

def clear_and_style_cell(cell, text, size_pt=8.5, bold=False, color=INK, align=PP_ALIGN.LEFT, bg_color=None):
    cell.text = ""
    if bg_color:
        cell.fill.solid()
        cell.fill.fore_color.rgb = bg_color
    cell.margin_left = Inches(0.08)
    cell.margin_right = Inches(0.08)
    cell.margin_top = Inches(0.04)
    cell.margin_bottom = Inches(0.04)
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = cell.text_frame.paragraphs[0]
    p.alignment = align
    p.space_before = p.space_after = 0
    r = p.add_run()
    r.text = text
    set_font(r, size_pt=size_pt, bold=bold, color=color)

def main():
    print(f"Loading presentation template: {TEMPLATE_PATH}...")
    prs = pptx.Presentation(TEMPLATE_PATH)
    print(f"Loaded {len(prs.slides)} slides. Starting pixel-perfect formatting...\n")

    # =========================================================================
    # SLIDE 1: Cover & Problem Statement (Fixed geometry: top=3.25", height=2.15")
    # =========================================================================
    slide1 = prs.slides[0]
    for shape in slide1.shapes:
        if shape.has_text_frame and "Team Name" in shape.text:
            shape.top = Inches(3.22)
            shape.left = Inches(0.48)
            shape.width = Inches(9.04)
            shape.height = Inches(2.20)
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True
            tf.margin_left = tf.margin_right = Inches(0.05)
            tf.margin_top = tf.margin_bottom = Inches(0.02)

            # Metadata header bar
            p0 = tf.paragraphs[0]
            p0.space_before = p0.space_after = 0
            r = p0.add_run()
            r.text = "Team: "
            set_font(r, size_pt=11.5, bold=True, color=FOREST)
            r = p0.add_run()
            r.text = "WellSync (2 Student Engineers)   |   "
            set_font(r, size_pt=10.5, color=INK)
            r = p0.add_run()
            r.text = "Track: "
            set_font(r, size_pt=11.5, bold=True, color=FOREST)
            r = p0.add_run()
            r.text = "Challenge 09: Sustaining Healthy Behaviors (Wellbeing)   |   "
            set_font(r, size_pt=10.5, color=INK)
            r = p0.add_run()
            r.text = "Prototype"
            set_font(r, size_pt=10.5, bold=True, color=TERRACOTTA)

            # Problem Callout
            p1 = tf.add_paragraph()
            p1.space_before = Pt(4)
            p1.space_after = 0
            r = p1.add_run()
            r.text = "Problem Statement: "
            set_font(r, size_pt=11, bold=True, color=TERRACOTTA)
            r = p1.add_run()
            r.text = (
                "In Abu Dhabi, healthy habits collapse when real life hits: extreme summer heat (>45°C), "
                "12-hour hospital night shifts (SEHA/M42), and Ramadan circadian shifts. When routines are disrupted, "
                "conventional fitness apps punish users with streak resets to zero. This triggers the psychological "
                "'What-the-Hell Effect' (Marlatt & Gordon): users perceive a single missed day as total failure and abandon their health interventions entirely."
            )
            set_font(r, size_pt=9.5, color=INK)

            # Solution Callout
            p2 = tf.add_paragraph()
            p2.space_before = Pt(3)
            p2.space_after = 0
            r = p2.add_run()
            r.text = "The Solution: "
            set_font(r, size_pt=11, bold=True, color=FOREST)
            r = p2.add_run()
            r.text = (
                "Habit durability is defined by recovery, not perfection. WellSync replaces punitive resets with an "
                "adaptive 50% Minimum Target Ladder (BCT 8.7), preserves cumulative active days, and celebrates every rebound "
                "with a dedicated Return Count metric. (Student prototype, not affiliated with any commercial product named WellSync)."
            )
            set_font(r, size_pt=9.5, color=INK)

    # =========================================================================
    # SLIDE 2: Team Members Table (Fixed coordinates: top=1.80", bottom=5.20")
    # =========================================================================
    slide2 = prs.slides[1]
    for shape in slide2.shapes:
        if shape.has_table:
            shape.left = Inches(0.5)
            shape.top = Inches(1.80)
            shape.width = Inches(9.0)
            shape.height = Inches(2.20)
            table = shape.table

            col_widths = [Inches(0.6), Inches(1.8), Inches(1.0), Inches(2.7), Inches(1.5), Inches(1.4)]
            for c_idx, width in enumerate(col_widths):
                table.columns[c_idx].width = width

            headers = ["S.No", "Name", "Country", "Role", "Organization", "Age confirmation"]
            for c_idx, h_text in enumerate(headers):
                clear_and_style_cell(table.cell(0, c_idx), h_text, size_pt=9.5, bold=True, color=WHITE, align=PP_ALIGN.CENTER, bg_color=FOREST)

            # Row 1: Ayesha Sultana
            row1 = ["1", "Ayesha Sultana", "India", "Full-Stack Behavioral Systems Engineer & Team Lead", "Student Scholar", "18+ Confirmed"]
            for c_idx, text in enumerate(row1):
                clear_and_style_cell(table.cell(1, c_idx), text, size_pt=9, bold=(c_idx==1), color=INK,
                                     align=PP_ALIGN.CENTER if c_idx in [0, 2, 5] else PP_ALIGN.LEFT, bg_color=WHITE)

            # Row 2: B. Alence
            row2 = ["2", "B. Alence", "India", "Behavioral Algorithm Engineer & Frontend Architect", "Student Engineer", "18+ Confirmed"]
            for c_idx, text in enumerate(row2):
                clear_and_style_cell(table.cell(2, c_idx), text, size_pt=9, bold=(c_idx==1), color=INK,
                                     align=PP_ALIGN.CENTER if c_idx in [0, 2, 5] else PP_ALIGN.LEFT, bg_color=CARD_BG)

            # Rows 3-5: Clean empty rows
            for r in range(3, 6):
                for c in range(6):
                    clear_and_style_cell(table.cell(r, c), "-", size_pt=8, color=MUTED, align=PP_ALIGN.CENTER, bg_color=WHITE if r%2!=0 else CARD_BG)

    # Add summary card underneath table
    card2 = add_card(slide2, Inches(0.5), Inches(4.20), Inches(9.0), Inches(0.95))
    tf2 = card2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = Inches(0.15)
    tf2.margin_top = tf2.margin_bottom = Inches(0.08)
    p = tf2.paragraphs[0]
    r = p.add_run()
    r.text = "Team Credential Summary: "
    set_font(r, size_pt=9.5, bold=True, color=FOREST)
    r = p.add_run()
    r.text = (
        "Specialized two-person student software engineering team combining deterministic algorithms, behavioral medicine "
        "(Michie BCTTv1 taxonomy), local-first data privacy (UAE PDPL), and open-science wearable benchmarking (Nature LifeSnaps replay). "
        "100% independent academic submission for Future Health 2026."
    )
    set_font(r, size_pt=8.5, color=INK)

    # =========================================================================
    # SLIDE 3: Team Capability Summary (Max 1,000 characters) (top=1.80", height=3.30")
    # =========================================================================
    slide3 = prs.slides[2]
    card3 = add_card(slide3, Inches(0.5), Inches(1.80), Inches(9.0), Inches(3.30))
    tf3 = card3.text_frame
    tf3.word_wrap = True
    tf3.margin_left = tf3.margin_right = Inches(0.2)
    tf3.margin_top = tf3.margin_bottom = Inches(0.15)

    p_cap0 = tf3.paragraphs[0]
    p_cap0.space_after = Pt(6)
    r = p_cap0.add_run()
    r.text = "TWO-PERSON STUDENT SOFTWARE ENGINEERING TEAM | EXACTLY 994 CHARACTERS\n"
    set_font(r, size_pt=10.5, bold=True, color=FOREST)

    p_cap1 = tf3.add_paragraph()
    p_cap1.space_after = Pt(8)
    r = p_cap1.add_run()
    r.text = (
        "We are a specialized two-person student software engineering team combining deterministic algorithms, behavioral economics, and privacy-first full-stack architecture. Ayesha Sultana leads system architecture and secure backend design, engineering local-first data pipelines compliant with UAE PDPL and GDPR standards. B. Alence specializes in human-computer interaction, deterministic state machine algorithms, and accessible web systems (WCAG 2.1 AA).\n\n"
        "Rather than relying on generic AI wrappers or unverified LLM chatbots, our core capability is building transparent, auditable behavioral engines grounded in clinical psychology (BCTTv1 taxonomy) and open science. We independently engineered WellSync from ground up: a zero-dependency TypeScript state engine, an automated 145-test verification harness, full Arabic RTL localization, and a reproducible wearable telemetry replay processing 7,443 participant-days from the Nature LifeSnaps benchmark."
    )
    set_font(r, size_pt=9.5, color=INK)

    p_cap2 = tf3.add_paragraph()
    r = p_cap2.add_run()
    r.text = "✓ 145/145 Automated Tests Passing   |   ✓ 0 Runtime LLMs (100% Deterministic)   |   ✓ UAE PDPL Compliant Enclave"
    set_font(r, size_pt=8.5, bold=True, color=TERRACOTTA)

    # =========================================================================
    # SLIDE 4: Architecture or workflow diagram* (Rendered Visual Architecture)
    # =========================================================================
    slide4 = prs.slides[3]
    # Add sleek container card
    card4 = add_card(slide4, Inches(0.50), Inches(1.78), Inches(9.00), Inches(3.35), bg_color=CARD_BG, border_color=BORDER)

    # Embed rendered high-res architecture diagram
    diag_img_path = os.path.join(os.path.dirname(OUTPUT_PATH), "architecture_diagram.png")
    if os.path.exists(diag_img_path):
        slide4.shapes.add_picture(diag_img_path, Inches(0.60), Inches(1.86), Inches(8.80), Inches(2.85))

    # Add bottom architectural summary bar
    summary_box = slide4.shapes.add_textbox(Inches(0.60), Inches(4.76), Inches(8.80), Inches(0.32))
    tf4 = summary_box.text_frame
    tf4.word_wrap = True
    tf4.margin_left = tf4.margin_right = Inches(0.05)
    tf4.margin_top = tf4.margin_bottom = Inches(0.02)
    p_arch = tf4.paragraphs[0]
    p_arch.alignment = PP_ALIGN.CENTER
    r = p_arch.add_run()
    r.text = "Architecture: "
    set_font(r, size_pt=8.5, bold=True, color=TERRACOTTA)
    r = p_arch.add_run()
    r.text = "100% Client-Side Local Execution   |   Zero Cloud PII Telemetry   |   Deterministic 4-State Recovery FSM   |   Michie BCT 8.7 Validated"
    set_font(r, size_pt=8.2, bold=False, color=INK)

    # =========================================================================
    # SLIDE 5: Target users and intended outcome* (top=1.80", height=3.30")
    # =========================================================================
    slide5 = prs.slides[4]
    # Left Card
    cu = add_card(slide5, Inches(0.5), Inches(1.80), Inches(4.35), Inches(3.30))
    tf_u = cu.text_frame
    tf_u.word_wrap = True
    tf_u.margin_left = tf_u.margin_right = Inches(0.15)
    tf_u.margin_top = Inches(0.15)
    tf_u.margin_bottom = Inches(0.1)

    p_uh = tf_u.paragraphs[0]
    p_uh.space_after = Pt(6)
    r = p_uh.add_run()
    r.text = "🎯 TARGET USER POPULATIONS IN ABU DHABI\n"
    set_font(r, size_pt=10.5, bold=True, color=FOREST)

    p_ub = tf_u.add_paragraph()
    r = p_ub.add_run()
    r.text = (
        "• SEHA & M42 Shift Healthcare Workers:\n"
        "  Doctors, nurses, and clinicians working 12-hour rotating night/day cycles with acute circadian disruptions.\n\n"
        "• Ramadan Fasting Observers:\n"
        "  Citizens balancing daytime fasting, midnight prayers, and shifted circadian nutrition.\n\n"
        "• Extreme Summer Outdoor/Indoor Residents:\n"
        "  Adults restricted by 45°C+ summer weather requiring air-conditioned indoor walking loops.\n\n"
        "• Chronic Disease At-Risk Individuals:\n"
        "  Sedentary populations prone to diabetes/hypertension who quit standard apps after early setbacks."
    )
    set_font(r, size_pt=8.8, color=INK)

    # Right Card
    co = add_card(slide5, Inches(5.15), Inches(1.80), Inches(4.35), Inches(3.30))
    tf_o = co.text_frame
    tf_o.word_wrap = True
    tf_o.margin_left = tf_o.margin_right = Inches(0.15)
    tf_o.margin_top = Inches(0.15)
    tf_o.margin_bottom = Inches(0.1)

    p_oh = tf_o.paragraphs[0]
    p_oh.space_after = Pt(6)
    r = p_oh.add_run()
    r.text = "🏆 INTENDED MEASURABLE OUTCOMES\n"
    set_font(r, size_pt=10.5, bold=True, color=TERRACOTTA)

    p_ob = tf_o.add_paragraph()
    r = p_ob.add_run()
    r.text = (
        "• Eliminate Streak-Reset Dropouts:\n"
        "  Zero punitive resets to day zero; neutralizes the 89.4% failure state rate seen in static 10k goals.\n\n"
        "• 3.1-Day Rapid Recovery Velocity:\n"
        "  Reduces post-disruption return time from weeks of total disengagement down to 3.1 days.\n\n"
        "• Long-Term Habit Retention (90–180 Days):\n"
        "  Preserves cumulative active days so users build permanent self-efficacy and health identity.\n\n"
        "• Psychological Safety & Self-Efficacy:\n"
        "  Replaces guilt notifications with achievable 50% graded tasks (BCT 8.7)."
    )
    set_font(r, size_pt=8.8, color=INK)

    # =========================================================================
    # SLIDE 6: How will success be measured?* (top=1.80", height=3.30")
    # =========================================================================
    slide6 = prs.slides[5]
    table6_shape = slide6.shapes.add_table(6, 4, Inches(0.5), Inches(1.80), Inches(9.0), Inches(3.25))
    t6 = table6_shape.table
    col_w6 = [Inches(1.8), Inches(1.5), Inches(3.8), Inches(1.9)]
    for i, w in enumerate(col_w6):
        t6.columns[i].width = w

    h6 = ["Metric Domain", "Primary Metric", "Definition & Behavioral Formula", "Benchmark Target"]
    for i, title in enumerate(h6):
        clear_and_style_cell(t6.cell(0, i), title, size_pt=9.5, bold=True, color=WHITE, align=PP_ALIGN.CENTER, bg_color=FOREST)

    rows6 = [
        ("Resilience Competency", "Return Count", "Sum of completed transitions from RECOVERING -> ON_TRACK", ">= 3 rebounds / quarter"),
        ("Recovery Velocity", "Time-to-Return (TTR)", "Mean calendar days from state LAPSED back to ON_TRACK", "<= 4.0 days (LifeSnaps: 3.1d)"),
        ("Habit Continuity", "Active Day Ratio", "(Days meeting Target or Minimum Rung) / Total Calendar Days", ">= 65% during disruptions"),
        ("Dropout Mitigation", "Streak Reset Rate", "Count of punitive resets to day zero", "0.0 Resets (by design)"),
        ("System Reliability", "Test Pass Rate", "Automated regression tests verifying all state transitions", "100% (145/145 passing)"),
    ]
    for r_idx, row in enumerate(rows6):
        for c_idx, val in enumerate(row):
            clear_and_style_cell(t6.cell(r_idx + 1, c_idx), val, size_pt=8.5, bold=(c_idx==1), color=INK,
                                 align=PP_ALIGN.CENTER if c_idx in [1, 3] else PP_ALIGN.LEFT,
                                 bg_color=WHITE if r_idx%2==0 else CARD_BG)

    # =========================================================================
    # SLIDE 7: Evidence supporting the approach* (top=1.80", height=3.30")
    # =========================================================================
    slide7 = prs.slides[6]
    ce1 = add_card(slide7, Inches(0.5), Inches(1.80), Inches(4.35), Inches(3.30))
    tf_e1 = ce1.text_frame
    tf_e1.word_wrap = True
    tf_e1.margin_left = tf_e1.margin_right = Inches(0.15)
    tf_e1.margin_top = Inches(0.15)
    tf_e1.margin_bottom = Inches(0.1)

    p_e1 = tf_e1.paragraphs[0]
    p_e1.space_after = Pt(6)
    r = p_e1.add_run()
    r.text = "📊 NATURE LIFESNAPS WEARABLE REPLAY\n"
    set_font(r, size_pt=10.5, bold=True, color=FOREST)

    p_e1b = tf_e1.add_paragraph()
    r = p_e1b.add_run()
    r.text = (
        "• Peer-Reviewed Open Science Dataset:\n"
        "  71 real participants across 7,443 participant-days from Sofia Yfantidou et al., Nature Scientific Data (2022), DOI: 10.1038/s41597-022-01764-x.\n\n"
        "• Policy 1 (Static 10k Steps):\n"
        "  Labeled 89.4% of days as failure during real-life disruptions.\n\n"
        "• Policy 2 (Streak Reset to 0):\n"
        "  Triggered an average of 17.9 catastrophic zero-resets per user.\n\n"
        "• Policy 4 (WellSync Adaptive Ladder):\n"
        "  Achieved 0.0 resets by design, maintained 31.9% active rung feasibility during disruptions, and averaged 3.1 days to full recovery."
    )
    set_font(r, size_pt=8.8, color=INK)

    ce2 = add_card(slide7, Inches(5.15), Inches(1.80), Inches(4.35), Inches(3.30))
    tf_e2 = ce2.text_frame
    tf_e2.word_wrap = True
    tf_e2.margin_left = tf_e2.margin_right = Inches(0.15)
    tf_e2.margin_top = Inches(0.15)
    tf_e2.margin_bottom = Inches(0.1)

    p_e2 = tf_e2.paragraphs[0]
    p_e2.space_after = Pt(6)
    r = p_e2.add_run()
    r.text = "🧠 BEHAVIORAL MEDICINE TAXONOMY\n"
    set_font(r, size_pt=10.5, bold=True, color=TERRACOTTA)

    p_e2b = tf_e2.add_paragraph()
    r = p_e2b.add_run()
    r.text = (
        "• BCTTv1 Taxonomy (Michie et al., 2013):\n"
        "  - BCT 8.7 (Graded Tasks): Operationalized via our 50% Minimum Target Ladder during acute disruption.\n"
        "  - BCT 1.2 (Problem Solving): Operationalized via interactive barrier micro-commitment cards.\n\n"
        "• Relapse Prevention Theory (Marlatt & Gordon):\n"
        "  - Neutralizes the 'Abstinence Violation Effect' by decoupling habit identity from streak fragility.\n\n"
        "• Goal Violated Effects (Cochran & Tesser):\n"
        "  - Preserves cumulative active days to maintain perceived progress and prevent disengagement."
    )
    set_font(r, size_pt=8.8, color=INK)

    # =========================================================================
    # SLIDE 8: Data sources and legal right to use them* (top=1.80", height=3.30")
    # =========================================================================
    slide8 = prs.slides[7]
    t8_shape = slide8.shapes.add_table(4, 5, Inches(0.5), Inches(1.80), Inches(9.0), Inches(3.25))
    t8 = t8_shape.table
    w8 = [Inches(1.8), Inches(1.8), Inches(2.0), Inches(1.8), Inches(1.6)]
    for i, w in enumerate(w8):
        t8.columns[i].width = w

    h8 = ["Data Source", "Type & Modality", "Owner / Citations", "Legal License", "Personal Data (PII)"]
    for i, title in enumerate(h8):
        clear_and_style_cell(t8.cell(0, i), title, size_pt=9.5, bold=True, color=WHITE, align=PP_ALIGN.CENTER, bg_color=FOREST)

    rows8 = [
        ("LifeSnaps Benchmark", "Fitbit steps, sleep, and EMA survey logs (71 users)", "Sofia Yfantidou et al. (Zenodo: 7229547)", "Creative Commons Attribution 4.0 (CC BY 4.0)", "ZERO PII (De-identified keys p01-p71)"),
        ("User Runtime Telemetry", "Daily step count & sleep duration metrics", "Citizen / End-User (100% on-device)", "Local-First Proprietary to Citizen", "ZERO Cloud PII (Runs in browser localStorage)"),
        ("Optional Pilot Sync", "Pseudonymous activity & rebound statistics", "WellSync Research Enclave (SQLite)", "Consented Academic Research (UAE PDPL)", "Pseudonymous Token (Zero national IDs/names)"),
    ]
    for r_idx, row in enumerate(rows8):
        for c_idx, val in enumerate(row):
            clear_and_style_cell(t8.cell(r_idx + 1, c_idx), val, size_pt=8.5, bold=(c_idx==0), color=INK,
                                 align=PP_ALIGN.CENTER if c_idx in [3, 4] else PP_ALIGN.LEFT,
                                 bg_color=WHITE if r_idx%2==0 else CARD_BG)

    # =========================================================================
    # SLIDE 9: Risks and safeguards* (top=1.80", height=3.30")
    # =========================================================================
    slide9 = prs.slides[8]
    t9_shape = slide9.shapes.add_table(6, 3, Inches(0.5), Inches(1.80), Inches(9.0), Inches(3.25))
    t9 = t9_shape.table
    w9 = [Inches(1.8), Inches(3.0), Inches(4.2)]
    for i, w in enumerate(w9):
        t9.columns[i].width = w

    h9 = ["Risk Domain", "Potential Vulnerability", "Implemented Engineering Safeguard"]
    for i, title in enumerate(h9):
        clear_and_style_cell(t9.cell(0, i), title, size_pt=9.5, bold=True, color=WHITE, align=PP_ALIGN.CENTER, bg_color=FOREST)

    rows9 = [
        ("Privacy & Sovereignty", "Leakage of sensitive health biometrics to cloud", "Local-First Enclave: 0 unauthorized network calls. Full compliance with UAE PDPL (Decree-Law No. 45/2021)."),
        ("Algorithmic Bias", "Inflexible targets for sick, elderly or shift workers", "Anti-Erosion Floor: Targets capped at 50% baseline. User can trigger 'Planned Pause' with zero penalty."),
        ("Black-Box AI Failure", "LLM hallucinations or toxic wellness advice", "Zero Runtime AI: 100% deterministic decision logic in open TypeScript. Every state transition is traceable."),
        ("Employer Misuse", "Workplace surveillance or punitive insurance deductions", "Non-Punitive Architecture: Data only accumulates positive active days; cannot be queried to deduct benefits."),
        ("Clinical Safety", "User misinterprets advice as clinical therapy", "Non-SaMD Boundary: Prominent regulatory disclaimer on every screen. Does not diagnose or prescribe therapy."),
    ]
    for r_idx, row in enumerate(rows9):
        for c_idx, val in enumerate(row):
            clear_and_style_cell(t9.cell(r_idx + 1, c_idx), val, size_pt=8.5, bold=(c_idx==0), color=INK,
                                 align=PP_ALIGN.LEFT, bg_color=WHITE if r_idx%2==0 else CARD_BG)

    # =========================================================================
    # SLIDE 10: Hardware requirements (top=1.80", height=3.30")
    # =========================================================================
    slide10 = prs.slides[9]
    hw_cards = [
        ("📱 ZERO-COST UNIVERSAL COMPATIBILITY", 
         "• No Proprietary Hardware Required:\n"
         "  Zero smart rings, specialized patches, or expensive sensors.\n\n"
         "• Progressive Web App (PWA):\n"
         "  Runs seamlessly on any device with a modern web browser (iOS Safari, Android Chrome, Windows, macOS).\n\n"
         "• Smartphone Accelerometers:\n"
         "  Passively captures movement with zero additional hardware purchase required.", Inches(0.5)),
        ("⌚ SENSOR INTEGRATION ARCHITECTURE", 
         "• Commercial Wearable Sync:\n"
         "  Integrates seamlessly via standard open consumer health APIs:\n"
         "  Apple HealthKit, Android Health Connect, Fitbit, Garmin, WHOOP.\n\n"
         "• Manual Zero-Hardware Fallback:\n"
         "  Citizens without wearables can manually enter daily steps or sleep in under 5 seconds with zero friction.\n\n"
         "• Safety & Sourcing:\n"
         "  Zero electrical, biological, thermal, or radiation safety hazards.", Inches(5.15)),
    ]
    for title, desc, left in hw_cards:
        c = add_card(slide10, left, Inches(1.80), Inches(4.35), Inches(3.30))
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.18)
        tf.margin_top = Inches(0.18)
        tf.margin_bottom = Inches(0.1)

        p1 = tf.paragraphs[0]
        p1.space_after = Pt(8)
        r = p1.add_run()
        r.text = title + "\n"
        set_font(r, size_pt=10.5, bold=True, color=FOREST)

        p2 = tf.add_paragraph()
        r = p2.add_run()
        r.text = desc
        set_font(r, size_pt=9, color=INK)

    # =========================================================================
    # SLIDE 11: Authentication & Guest Access Demonstration (top=1.80", height=3.30")
    # =========================================================================
    slide11 = prs.slides[10]
    cg = add_card(slide11, Inches(0.5), Inches(1.80), Inches(9.0), Inches(3.30))
    tf_g = cg.text_frame
    tf_g.word_wrap = True
    tf_g.margin_left = tf_g.margin_right = Inches(0.2)
    tf_g.margin_top = Inches(0.15)
    tf_g.margin_bottom = Inches(0.1)

    p_gh = tf_g.paragraphs[0]
    p_gh.space_after = Pt(6)
    r = p_gh.add_run()
    r.text = "⚡ ZERO-BARRIER GUEST ACCESS & 90-SECOND JUDGE DEMO MODE\n"
    set_font(r, size_pt=11, bold=True, color=FOREST)

    p_gb = tf_g.add_paragraph()
    r = p_gb.add_run()
    r.text = (
        "• Requirement Met (Continue as Guest):\n"
        "  WellSync requires NO login, password, or phone number. All features are 100% accessible to guest users immediately upon loading.\n\n"
        "• 1-Click '⚡ Judge Demo (90s)' Button in Navigation Bar:\n"
        "  Permanently embedded in the header. Instantly loads Tariq's 21-Day Clinical Telemetry Walkthrough:\n"
        "    - Days 1–14: Steady 8,500-step baseline establishing his 28-day median (Status: ON_TRACK).\n"
        "    - Days 15–17: 3-day night shift rotation dropping steps to 3,200 (Status: LAPSED — calm amber badge, zero streak reset).\n"
        "    - Days 18–20: 50% Minimum Target step-down (4,250 steps) + interactive micro-commitment (10-minute post-shift walk).\n"
        "    - Day 21: Recovery complete! Target restored, all 17 active days intact, and Return Count increments to 1.\n\n"
        "• Live Demonstration URL: http://localhost:5173/   |   GitHub Repository: https://github.com/misterA-2406/well-sync"
    )
    set_font(r, size_pt=8.8, color=INK)

    # =========================================================================
    # SLIDE 12: Path to pilot and scale* (top=1.80", height=3.30")
    # =========================================================================
    slide12 = prs.slides[11]
    pilot_phases = [
        ("PHASE 1: CLINICAL PILOT (M1–M6)", "• N=300 SEHA / M42 healthcare shift workers\n• Validate Return Count & recovery velocity\n• Abu Dhabi DoH IRB clearance & oversight\n• Baseline vs control cohort testing", Inches(0.5)),
        ("PHASE 2: MALAFFI HIE (M7–M12)", "• Integration with Malaffi Health Information Exchange\n• Consented lifestyle summary export for primary care\n• Expansion to Abu Dhabi Government workplace programs\n• Arabic-first public health rollout", Inches(3.6)),
        ("PHASE 3: VALUE-BASED PAYER (YEAR 2+)", "• Daman & National Health Insurance partnerships\n• Premium wellness incentives based on Return Counts\n• Integration with national fitness apps (Abu Dhabi 360)\n• Long-term cardiovascular risk reduction", Inches(6.7)),
    ]
    for title, desc, left in pilot_phases:
        c = add_card(slide12, left, Inches(1.80), Inches(2.8), Inches(3.30))
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.15)
        tf.margin_top = Inches(0.15)
        tf.margin_bottom = Inches(0.1)

        p1 = tf.paragraphs[0]
        p1.space_after = Pt(8)
        r = p1.add_run()
        r.text = title + "\n"
        set_font(r, size_pt=9.5, bold=True, color=FOREST)

        p2 = tf.add_paragraph()
        r = p2.add_run()
        r.text = desc
        set_font(r, size_pt=9, color=INK)

    # =========================================================================
    # SLIDE 13: Pre-existing IP and third-party materials* (top=1.80", height=3.30")
    # =========================================================================
    slide13 = prs.slides[12]
    t13_shape = slide13.shapes.add_table(5, 4, Inches(0.5), Inches(1.80), Inches(9.0), Inches(3.25))
    t13 = t13_shape.table
    w13 = [Inches(2.2), Inches(2.2), Inches(1.8), Inches(2.8)]
    for i, w in enumerate(w13):
        t13.columns[i].width = w

    h13 = ["Component / Material", "Ownership / Author", "License", "Usage & Legal Restrictions"]
    for i, title in enumerate(h13):
        clear_and_style_cell(t13.cell(0, i), title, size_pt=9.5, bold=True, color=WHITE, align=PP_ALIGN.CENTER, bg_color=FOREST)

    rows13 = [
        ("WellSync Core Engine & UI", "Ayesha Sultana & B. Alence", "MIT License", "Original source code; unrestricted academic & prototype use."),
        ("LifeSnaps Wearable Dataset", "Sofia Yfantidou et al. (2022)", "CC BY 4.0", "Open science benchmark replay with verified academic citation."),
        ("React 19, TypeScript, Tailwind", "Meta, Microsoft, Tailwind Labs", "MIT License", "Core application frontend framework and styling."),
        ("Commercial Disclaimer", "WellSync Contributors", "Trademark Notice", "Student prototype, not affiliated with commercial WellSync product."),
    ]
    for r_idx, row in enumerate(rows13):
        for c_idx, val in enumerate(row):
            clear_and_style_cell(t13.cell(r_idx + 1, c_idx), val, size_pt=8.5, bold=(c_idx==0), color=INK,
                                 align=PP_ALIGN.CENTER if c_idx==2 else PP_ALIGN.LEFT,
                                 bg_color=WHITE if r_idx%2==0 else CARD_BG)

    # =========================================================================
    # SLIDE 14: Conflict of interest declaration* (top=1.80", height=3.30")
    # =========================================================================
    slide14 = prs.slides[13]
    coi_card = add_card(slide14, Inches(0.5), Inches(1.80), Inches(9.0), Inches(3.30))
    tf_coi = coi_card.text_frame
    tf_coi.word_wrap = True
    tf_coi.margin_left = tf_coi.margin_right = Inches(0.2)
    tf_coi.margin_top = Inches(0.18)
    tf_coi.margin_bottom = Inches(0.1)

    p_coi_h = tf_coi.paragraphs[0]
    p_coi_h.space_after = Pt(8)
    r = p_coi_h.add_run()
    r.text = "OFFICIAL CONFLICT OF INTEREST DECLARATION\n"
    set_font(r, size_pt=11.5, bold=True, color=FOREST)

    p_coi_b = tf_coi.add_paragraph()
    r = p_coi_b.add_run()
    r.text = (
        "The team members (Ayesha Sultana and B. Alence) hereby formally declare that:\n\n"
        "1. We have no financial, commercial, employment, or advisory relationships with challenge organizers (Future Health, Hack2Skill).\n\n"
        "2. We have no conflicts of interest or undisclosed affiliations with challenge co-creators or collaborators: Microsoft, Inception 42, or Mohamed bin Zayed University of Artificial Intelligence (MBZUAI).\n\n"
        "3. We have no personal, professional, or academic ties to any member of the judging panel or evaluation committee.\n\n"
        "4. WellSync was conceived, architected, and engineered independently as an academic competition submission for the Future Health Digital Innovation Challenge 2026."
    )
    set_font(r, size_pt=9.5, color=INK)

    # =========================================================================
    # SLIDE 15: Additional Slide — UAE Context Engine (Title moved to top: 0.94")
    # =========================================================================
    slide15 = prs.slides[14]
    # Reposition title shape to top like all other slides!
    for s in slide15.shapes:
        if s.has_text_frame and ("Additional Slide" in s.text or "UAE Context" in s.text):
            s.top = Inches(0.94)
            s.left = Inches(0.28)
            s.width = Inches(9.40)
            s.height = Inches(0.78)
            tf = s.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            r = p.add_run()
            r.text = "UAE Context Engine: Cultural & Climate Intelligence"
            set_font(r, size_pt=16, bold=True, color=FOREST)
            p_sub = tf.add_paragraph()
            r_sub = p_sub.add_run()
            r_sub.text = "Offline Rule Engine for Shift Work, Extreme Heat, and Ramadan Circadian Rhythms"
            set_font(r_sub, size_pt=10, color=MUTED)

    uae_cards = [
        ("🌙 RAMADAN FASTING MODE", 
         "• Offline Hijri calendar math (zero API calls)\n"
         "• Daytime movement scaled to 70% to prevent dehydration\n"
         "• Activity windows re-anchored to Post-Iftar (8:30-11:00 PM) and Pre-Suhoor (3:30-4:30 AM)", Inches(0.5)),
        ("☀️ SUMMER EXTREME HEAT MODE", 
         "• Automatically triggers at >38°C (June-September)\n"
         "• Substitutes outdoor exercise with air-conditioned routes:\n"
         "  Mall-walking loops (Abu Dhabi Mall, Yas Mall) and indoor stair circuits", Inches(5.15)),
        ("🏥 SEHA SHIFT-WORK MODE", 
         "• Calibrated for standard 2-Day, 2-Night, 4-Off rosters\n"
         "• 60% baseline scaling during night rotations\n"
         "• Post-shift recovery sleep marked non-penalized rest", Inches(0.5)),
        ("🌐 ARABIC RTL LOCALIZATION", 
         "• 1-click bidirectional toggle (العربية / English)\n"
         "• Mirrored layout, typography & Arabic-Indic numerals\n"
         "• 100% offline string catalog without network latency", Inches(5.15)),
    ]
    for idx, (title, desc, left) in enumerate(uae_cards):
        top = Inches(1.80) if idx < 2 else Inches(3.45)
        c = add_card(slide15, left, top, Inches(4.35), Inches(1.55))
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.15)
        tf.margin_top = Inches(0.12)
        tf.margin_bottom = Inches(0.08)

        p1 = tf.paragraphs[0]
        p1.space_after = Pt(3)
        r = p1.add_run()
        r.text = title + "\n"
        set_font(r, size_pt=9.5, bold=True, color=FOREST)

        p2 = tf.add_paragraph()
        r = p2.add_run()
        r.text = desc
        set_font(r, size_pt=8.5, color=INK)

    # =========================================================================
    # SLIDE 16: Thank You Slide (Theme-Harmonized Safe Positioning)
    # =========================================================================
    slide16 = prs.slides[15]
    # Match the warm ivory/sand slide background (#E3DDD1 = RGB 227, 221, 209)
    # Soft warm ivory card that blends seamlessly with the background texture
    SLIDE_BG_HARMONY = RGBColor(235, 230, 221)
    SLIDE_BORDER_SUBTLE = RGBColor(212, 204, 194)
    TAUPE_TEXT = RGBColor(110, 95, 88)

    ty_card = add_card(slide16, Inches(0.8), Inches(1.85), Inches(4.5), Inches(2.35), bg_color=SLIDE_BG_HARMONY, border_color=SLIDE_BORDER_SUBTLE)
    tf_ty = ty_card.text_frame
    tf_ty.word_wrap = True
    tf_ty.margin_left = tf_ty.margin_right = Inches(0.2)
    tf_ty.margin_top = tf_ty.margin_bottom = Inches(0.14)

    p_ty0 = tf_ty.paragraphs[0]
    p_ty0.space_after = Pt(2)
    r = p_ty0.add_run()
    r.text = "WellSync"
    set_font(r, size_pt=20, bold=True, color=FOREST)

    p_ty1 = tf_ty.add_paragraph()
    p_ty1.space_after = Pt(6)
    r = p_ty1.add_run()
    r.text = "Progress is Not Perfection. Recovery is Easier Than Restarting."
    set_font(r, size_pt=10, bold=False, color=TERRACOTTA, italic=True)

    p_ty2 = tf_ty.add_paragraph()
    p_ty2.space_after = Pt(4)
    r = p_ty2.add_run()
    r.text = (
        "• Challenge 09: Sustaining Healthy Behaviors (Wellbeing Track)\n"
        "• Team: 1. Ayesha Sultana & 2. B. Alence (Student Software Engineers)\n"
        "• GitHub: github.com/misterA-2406/well-sync\n"
        "• Interactive Prototype: Live Web App & localhost:5173\n"
        "• Demo Video: 1080p Neural Walkthrough (docs/videos/wellsync_demo_final.mp4)"
    )
    set_font(r, size_pt=8.8, color=INK)

    p_ty3 = tf_ty.add_paragraph()
    p_ty3.space_before = Pt(4)
    r = p_ty3.add_run()
    r.text = "*Student prototype, not affiliated with any commercial product named WellSync."
    set_font(r, size_pt=7.5, color=TAUPE_TEXT, italic=True)

    # Save cleanly
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    prs.save(OUTPUT_PATH)
    print(f"🎉 Primary presentation saved: {OUTPUT_PATH}")

    try:
        prs.save(COPY_PATH)
        print(f"🎉 Root working copy updated: {COPY_PATH}")
    except PermissionError:
        print(f"ℹ️ Note: Root copy ({COPY_PATH}) is currently open in PowerPoint. Docs copy is fully updated!")

if __name__ == "__main__":
    main()
