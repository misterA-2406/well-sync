"""
Generate the official WellSync PowerPoint Pitch Deck by modifying the template.
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

# Color Palette
FOREST = RGBColor(24, 60, 50)       # #183C32 - Primary Brand
TERRACOTTA = RGBColor(201, 122, 72) # #C97A48 - Accent / Highlight
INK = RGBColor(26, 36, 33)          # #1A2421 - Dark Body Text
MUTED = RGBColor(90, 105, 100)      # Grayish Teal
LIGHT_BG = RGBColor(248, 249, 248)  # Card Fill
BORDER = RGBColor(215, 225, 220)    # Border Gray
WHITE = RGBColor(255, 255, 255)
AMBER_BG = RGBColor(254, 243, 199)
AMBER_TEXT = RGBColor(146, 64, 14)

def set_font(run, name="Segoe UI", size_pt=11, bold=False, color=INK, italic=False):
    run.font.name = name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color

def add_card(slide, left, top, width, height, bg_color=LIGHT_BG, border_color=BORDER):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.color.rgb = border_color
    shape.line.width = Pt(1)
    return shape

def add_header_badge(slide, text, left=Inches(0.4), top=Inches(1.5), width=Inches(4.5), height=Inches(0.35)):
    badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    badge.fill.solid()
    badge.fill.fore_color.rgb = FOREST
    badge.line.fill.background()
    tf = badge.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = text
    set_font(r, size_pt=10, bold=True, color=WHITE)
    return badge

def main():
    print(f"Loading presentation template: {TEMPLATE_PATH}...")
    prs = pptx.Presentation(TEMPLATE_PATH)
    print(f"Loaded {len(prs.slides)} slides.")

    # =========================================================================
    # SLIDE 1: Team Name / Team Size / Problem Statement
    # =========================================================================
    slide1 = prs.slides[0]
    # Find shape 2 which has "Team Name:  Team Size:  Problem Statement:"
    for shape in slide1.shapes:
        if shape.has_text_frame and "Team Name" in shape.text:
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True
            tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.1)

            # Team Info line
            p = tf.paragraphs[0]
            p.space_after = Pt(8)
            r1 = p.add_run()
            r1.text = "Team Name: "
            set_font(r1, size_pt=13, bold=True, color=FOREST)
            r2 = p.add_run()
            r2.text = "WellSync  |  "
            set_font(r2, size_pt=13, bold=False, color=INK)

            r3 = p.add_run()
            r3.text = "Team Size: "
            set_font(r3, size_pt=13, bold=True, color=FOREST)
            r4 = p.add_run()
            r4.text = "2 Members (Student Engineers)  |  "
            set_font(r4, size_pt=13, bold=False, color=INK)

            r5 = p.add_run()
            r5.text = "Challenge: "
            set_font(r5, size_pt=13, bold=True, color=FOREST)
            r6 = p.add_run()
            r6.text = "09: Sustaining Healthy Behaviors\n"
            set_font(r6, size_pt=13, bold=False, color=INK)

            # Problem Statement Header
            p2 = tf.add_paragraph()
            p2.space_before = Pt(4)
            p2.space_after = Pt(3)
            r_ps = p2.add_run()
            r_ps.text = "Problem Statement:"
            set_font(r_ps, size_pt=13, bold=True, color=TERRACOTTA)

            # Problem Statement Body
            p3 = tf.add_paragraph()
            p3.space_after = Pt(6)
            r_body1 = p3.add_run()
            r_body1.text = (
                "In Abu Dhabi, healthy habits collapse when real life hits: extreme summer heat (>45°C), "
                "12-hour hospital night shifts (SEHA/M42), and Ramadan circadian shifts. When routines are disrupted, "
                "conventional fitness apps punish users with streak resets to zero. This triggers the psychological "
                "'What-the-Hell Effect' (Marlatt & Gordon): users perceive a single missed day as total failure and abandon their health interventions entirely."
            )
            set_font(r_body1, size_pt=10.5, color=INK)

            # The Solution
            p4 = tf.add_paragraph()
            p4.space_before = Pt(3)
            r_sol_h = p4.add_run()
            r_sol_h.text = "The Solution: "
            set_font(r_sol_h, size_pt=11.5, bold=True, color=FOREST)
            r_sol = p4.add_run()
            r_sol.text = (
                "Habit durability is defined by recovery, not perfection. WellSync replaces punitive resets with an "
                "adaptive 50% Minimum Target Ladder (BCT 8.7), preserves cumulative active days, and celebrates every rebound "
                "with a dedicated Return Count metric. (Student prototype, not affiliated with any commercial product named WellSync)."
            )
            set_font(r_sol, size_pt=10.5, color=INK)

    # =========================================================================
    # SLIDE 2: Team Members Table
    # =========================================================================
    slide2 = prs.slides[1]
    for shape in slide2.shapes:
        if shape.has_table:
            table = shape.table
            # Adjust table width and position for clear presentation
            shape.left = Inches(0.5)
            shape.top = Inches(1.8)
            shape.width = Inches(9.0)
            shape.height = Inches(2.6)

            # Format headers
            col_widths = [Inches(0.6), Inches(1.8), Inches(1.0), Inches(2.6), Inches(1.6), Inches(1.4)]
            for c_idx, width in enumerate(col_widths):
                table.columns[c_idx].width = width

            headers = ["S.No", "Name", "Country", "Role", "Organization", "Age confirmation"]
            for c_idx, h_text in enumerate(headers):
                cell = table.cell(0, c_idx)
                cell.text = h_text
                cell.fill.solid()
                cell.fill.fore_color.rgb = FOREST
                p = cell.text_frame.paragraphs[0]
                p.alignment = PP_ALIGN.CENTER
                set_font(p.runs[0], size_pt=10, bold=True, color=WHITE)

            # Row 1: Ayesha Sultana
            row1_data = ["1", "Ayesha Sultana", "India", "Full-Stack Behavioral Systems Engineer & Team Lead", "Student Scholar", "18+ Confirmed"]
            for c_idx, text in enumerate(row1_data):
                cell = table.cell(1, c_idx)
                cell.text = text
                cell.fill.solid()
                cell.fill.fore_color.rgb = WHITE
                p = cell.text_frame.paragraphs[0]
                p.alignment = PP_ALIGN.CENTER if c_idx in [0, 2, 5] else PP_ALIGN.LEFT
                set_font(p.runs[0], size_pt=9.5, bold=(c_idx == 1), color=INK)

            # Row 2: B. Alence
            row2_data = ["2", "B. Alence", "India", "Behavioral Algorithm Engineer & Frontend Architect", "Student Engineer", "18+ Confirmed"]
            for c_idx, text in enumerate(row2_data):
                cell = table.cell(2, c_idx)
                cell.text = text
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BG
                p = cell.text_frame.paragraphs[0]
                p.alignment = PP_ALIGN.CENTER if c_idx in [0, 2, 5] else PP_ALIGN.LEFT
                set_font(p.runs[0], size_pt=9.5, bold=(c_idx == 1), color=INK)

            # Rows 3-5: Empty/Unused
            for r in range(3, 6):
                for c in range(6):
                    cell = table.cell(r, c)
                    cell.text = "-"
                    p = cell.text_frame.paragraphs[0]
                    p.alignment = PP_ALIGN.CENTER
                    set_font(p.runs[0], size_pt=8, color=MUTED)

    # =========================================================================
    # SLIDE 3: Team Capability Summary (Max 1,000 characters)
    # =========================================================================
    slide3 = prs.slides[2]
    # Add main card
    card3 = add_card(slide3, Inches(0.5), Inches(1.6), Inches(9.0), Inches(3.2))
    tf3 = card3.text_frame
    tf3.word_wrap = True
    tf3.margin_left = tf3.margin_right = tf3.margin_top = tf3.margin_bottom = Inches(0.2)

    p_cap = tf3.paragraphs[0]
    p_cap.space_after = Pt(10)
    r_cap_h = p_cap.add_run()
    r_cap_h.text = "Two-Person Student Software Engineering Team | 994 Characters\n"
    set_font(r_cap_h, size_pt=12, bold=True, color=FOREST)

    r_cap_body = p_cap.add_run()
    r_cap_body.text = (
        "We are a specialized two-person student software engineering team combining deterministic algorithms, behavioral economics, and privacy-first full-stack architecture. Ayesha Sultana leads system architecture and secure backend design, engineering local-first data pipelines compliant with UAE PDPL and GDPR standards. B. Alence specializes in human-computer interaction, deterministic state machine algorithms, and accessible web systems (WCAG 2.1 AA).\n\n"
        "Rather than relying on generic AI wrappers or unverified LLM chatbots, our core capability is building transparent, auditable behavioral engines grounded in clinical psychology (BCTTv1 taxonomy) and open science. We independently engineered WellSync from ground up: a zero-dependency TypeScript state engine, an automated 145-test verification harness, full Arabic RTL localization, and a reproducible wearable telemetry replay processing 7,443 participant-days from the Nature LifeSnaps benchmark."
    )
    set_font(r_cap_body, size_pt=10.5, color=INK)

    # =========================================================================
    # SLIDE 4: Architecture or workflow diagram*
    # =========================================================================
    slide4 = prs.slides[3]
    # 4 Architecture Cards
    steps = [
        ("1. SENSORS & TELEMETRY", "• Steps & Sleep duration\n• Zero cloud dependency\n• Manual & Health Connect\n• 100% on-device capture", Inches(0.5)),
        ("2. UAE CONTEXT ENGINE", "• Ramadan Fasting Mode\n• Summer Heat Mode (>38°C)\n• Shift-Work (SEHA 2D/2N/4Off)\n• Planned Pause (zero penalty)", Inches(2.8)),
        ("3. 4-STATE MACHINE", "• ON_TRACK (Median goal)\n• SLIPPING (1-2 days down)\n• LAPSED (3+ days below 60%)\n• RECOVERING (50% ladder)\n• Zero LLM hallucinations", Inches(5.1)),
        ("4. RESILIENT LADDER", "• Stretch Rung (110%)\n• Target Rung (100%)\n• Minimum Rung (50%)\n• Active Days Preserved\n• Return Count Increments", Inches(7.4)),
    ]
    for title, desc, left in steps:
        c = add_card(slide4, left, Inches(1.6), Inches(2.15), Inches(3.2))
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.12)
        p1 = tf.paragraphs[0]
        p1.space_after = Pt(8)
        r_th = p1.add_run()
        r_th.text = title + "\n"
        set_font(r_th, size_pt=10, bold=True, color=FOREST)

        p2 = tf.add_paragraph()
        r_desc = p2.add_run()
        r_desc.text = desc
        set_font(r_desc, size_pt=9.5, color=INK)

    # =========================================================================
    # SLIDE 5: Target users and intended outcome*
    # =========================================================================
    slide5 = prs.slides[4]
    # Left Card: Target Users
    cu = add_card(slide5, Inches(0.5), Inches(1.6), Inches(4.35), Inches(3.2))
    tf_u = cu.text_frame
    tf_u.word_wrap = True
    tf_u.margin_left = tf_u.margin_right = tf_u.margin_top = tf_u.margin_bottom = Inches(0.18)
    p_uh = tf_u.paragraphs[0]
    p_uh.space_after = Pt(8)
    r_uh = p_uh.add_run()
    r_uh.text = "🎯 TARGET USER POPULATIONS IN ABU DHABI\n"
    set_font(r_uh, size_pt=11, bold=True, color=FOREST)

    users_text = (
        "• SEHA & M42 Shift Healthcare Workers:\n"
        "  Doctors, nurses, and technicians working 12-hour rotating night/day rosters with circadian disruptions.\n\n"
        "• Ramadan Fasting Observers:\n"
        "  Citizens balancing daytime fasting, midnight prayers, and shifted eating windows.\n\n"
        "• Summer Outdoor/Indoor Demographics:\n"
        "  Residents restricted by 45°C+ summer weather requiring air-conditioned indoor activity pathways.\n\n"
        "• Chronic Disease At-Risk Individuals:\n"
        "  Sedentary adults prone to diabetes/hypertension who quit standard apps after minor lapses."
    )
    p_ub = tf_u.add_paragraph()
    r_ub = p_ub.add_run()
    r_ub.text = users_text
    set_font(r_ub, size_pt=9.5, color=INK)

    # Right Card: Intended Outcomes
    co = add_card(slide5, Inches(5.15), Inches(1.6), Inches(4.35), Inches(3.2))
    tf_o = co.text_frame
    tf_o.word_wrap = True
    tf_o.margin_left = tf_o.margin_right = tf_o.margin_top = tf_o.margin_bottom = Inches(0.18)
    p_oh = tf_o.paragraphs[0]
    p_oh.space_after = Pt(8)
    r_oh = p_oh.add_run()
    r_oh.text = "🏆 INTENDED MEASURABLE OUTCOMES\n"
    set_font(r_oh, size_pt=11, bold=True, color=TERRACOTTA)

    outcomes_text = (
        "• Eliminate Streak-Reset Dropouts:\n"
        "  Zero punitive resets to day zero; neutralizes the 89.4% failure state rate seen in static 10k goals.\n\n"
        "• 3.1-Day Rapid Recovery Velocity:\n"
        "  Reduces post-disruption return time from weeks of total disengagement down to 3.1 days.\n\n"
        "• Long-Term Habit Retention (90–180 Days):\n"
        "  Preserves cumulative active days so users build permanent self-efficacy and health identity.\n\n"
        "• Psychological Safety & Zero Guilt:\n"
        "  Replaces guilt notifications with achievable 50% graded tasks (BCT 8.7)."
    )
    p_ob = tf_o.add_paragraph()
    r_ob = p_ob.add_run()
    r_ob.text = outcomes_text
    set_font(r_ob, size_pt=9.5, color=INK)

    # =========================================================================
    # SLIDE 6: How will success be measured?*
    # =========================================================================
    slide6 = prs.slides[5]
    table6_shape = slide6.shapes.add_table(6, 4, Inches(0.5), Inches(1.6), Inches(9.0), Inches(3.2))
    t6 = table6_shape.table
    col_w6 = [Inches(1.8), Inches(1.5), Inches(3.8), Inches(1.9)]
    for i, w in enumerate(col_w6):
        t6.columns[i].width = w

    h6 = ["Metric Domain", "Primary Metric", "Definition & Behavioral Formula", "Benchmark Target"]
    for i, title in enumerate(h6):
        cell = t6.cell(0, i)
        cell.text = title
        cell.fill.solid()
        cell.fill.fore_color.rgb = FOREST
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        set_font(p.runs[0], size_pt=9.5, bold=True, color=WHITE)

    rows6 = [
        ("Resilience Competency", "Return Count", "Sum of completed transitions from RECOVERING -> ON_TRACK", ">= 3 rebounds / quarter"),
        ("Recovery Velocity", "Time-to-Return (TTR)", "Mean calendar days from state LAPSED back to ON_TRACK", "<= 4.0 days (LifeSnaps: 3.1d)"),
        ("Habit Continuity", "Active Day Ratio", "(Days meeting Target or Minimum Rung) / Total Calendar Days", ">= 65% during disruptions"),
        ("Dropout Mitigation", "Streak Reset Rate", "Count of punitive resets to day zero", "0.0 Resets (by design)"),
        ("System Reliability", "Test Pass Rate", "Automated regression tests verifying all state transitions", "100% (145/145 passing)"),
    ]
    for r_idx, row in enumerate(rows6):
        for c_idx, val in enumerate(row):
            cell = t6.cell(r_idx + 1, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = WHITE if r_idx % 2 == 0 else LIGHT_BG
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.CENTER if c_idx in [1, 3] else PP_ALIGN.LEFT
            set_font(p.runs[0], size_pt=8.5, bold=(c_idx == 1), color=INK)

    # =========================================================================
    # SLIDE 7: Evidence supporting the approach*
    # =========================================================================
    slide7 = prs.slides[6]
    ce1 = add_card(slide7, Inches(0.5), Inches(1.6), Inches(4.35), Inches(3.2))
    tf_e1 = ce1.text_frame
    tf_e1.word_wrap = True
    tf_e1.margin_left = tf_e1.margin_right = tf_e1.margin_top = tf_e1.margin_bottom = Inches(0.18)
    p_e1 = tf_e1.paragraphs[0]
    p_e1.space_after = Pt(6)
    r_e1h = p_e1.add_run()
    r_e1h.text = "📊 NATURE LIFESNAPS WEARABLE REPLAY\n"
    set_font(r_e1h, size_pt=11, bold=True, color=FOREST)

    replay_text = (
        "• Benchmark Dataset:\n"
        "  71 real participants across 7,443 participant-days from Sofia Yfantidou et al., Nature Scientific Data (2022), DOI: 10.1038/s41597-022-01764-x.\n\n"
        "• Policy 1 (Static 10k Steps):\n"
        "  Labeled 89.4% of days as failure during real-life disruptions.\n\n"
        "• Policy 2 (Streak Reset to 0):\n"
        "  Triggered an average of 17.9 catastrophic zero-resets per user.\n\n"
        "• Policy 4 (WellSync Adaptive Ladder):\n"
        "  Achieved 0.0 resets by design, maintained 31.9% active rung feasibility during disruptions, and averaged 3.1 days to full recovery."
    )
    p_e1b = tf_e1.add_paragraph()
    r_e1b = p_e1b.add_run()
    r_e1b.text = replay_text
    set_font(r_e1b, size_pt=9.5, color=INK)

    ce2 = add_card(slide7, Inches(5.15), Inches(1.6), Inches(4.35), Inches(3.2))
    tf_e2 = ce2.text_frame
    tf_e2.word_wrap = True
    tf_e2.margin_left = tf_e2.margin_right = tf_e2.margin_top = tf_e2.margin_bottom = Inches(0.18)
    p_e2 = tf_e2.paragraphs[0]
    p_e2.space_after = Pt(6)
    r_e2h = p_e2.add_run()
    r_e2h.text = "🧠 BEHAVIORAL MEDICINE TAXONOMY\n"
    set_font(r_e2h, size_pt=11, bold=True, color=TERRACOTTA)

    theory_text = (
        "• BCTTv1 Taxonomy (Michie et al., 2013):\n"
        "  - BCT 8.7 (Graded Tasks): Operationalized via our 50% Minimum Target Ladder during acute disruption.\n"
        "  - BCT 1.2 (Problem Solving): Operationalized via interactive barrier micro-commitment cards.\n\n"
        "• Relapse Prevention (Marlatt & Gordon):\n"
        "  - Neutralizes the 'Abstinence Violation Effect' by decoupling habit identity from streak fragility.\n\n"
        "• Goal Violated Effects (Cochran & Tesser):\n"
        "  - Preserves cumulative active days to maintain perceived progress and prevent disengagement."
    )
    p_e2b = tf_e2.add_paragraph()
    r_e2b = p_e2b.add_run()
    r_e2b.text = theory_text
    set_font(r_e2b, size_pt=9.5, color=INK)

    # =========================================================================
    # SLIDE 8: Data sources and legal right to use them*
    # =========================================================================
    slide8 = prs.slides[7]
    t8_shape = slide8.shapes.add_table(4, 5, Inches(0.5), Inches(1.6), Inches(9.0), Inches(3.2))
    t8 = t8_shape.table
    w8 = [Inches(1.8), Inches(1.8), Inches(2.0), Inches(1.8), Inches(1.6)]
    for i, w in enumerate(w8):
        t8.columns[i].width = w

    h8 = ["Data Source", "Type & Modality", "Owner / Citations", "Legal License", "Personal Data (PII)"]
    for i, title in enumerate(h8):
        cell = t8.cell(0, i)
        cell.text = title
        cell.fill.solid()
        cell.fill.fore_color.rgb = FOREST
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        set_font(p.runs[0], size_pt=9.5, bold=True, color=WHITE)

    rows8 = [
        ("LifeSnaps Benchmark", "Fitbit steps, sleep, and EMA survey logs (71 users)", "Sofia Yfantidou et al. (Zenodo: 7229547)", "Creative Commons Attribution 4.0 (CC BY 4.0)", "ZERO PII (De-identified keys p01-p71)"),
        ("User Runtime Telemetry", "Daily step count & sleep duration metrics", "Citizen / End-User (100% on-device)", "Local-First Proprietary to Citizen", "ZERO Cloud PII (Runs in browser localStorage)"),
        ("Optional Pilot Sync", "Pseudonymous activity & rebound statistics", "WellSync Research Enclave (SQLite)", "Consented Academic Research (UAE PDPL)", "Pseudonymous Token (Zero national IDs/names)"),
    ]
    for r_idx, row in enumerate(rows8):
        for c_idx, val in enumerate(row):
            cell = t8.cell(r_idx + 1, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = WHITE if r_idx % 2 == 0 else LIGHT_BG
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.CENTER if c_idx in [3, 4] else PP_ALIGN.LEFT
            set_font(p.runs[0], size_pt=8.5, bold=(c_idx == 0), color=INK)

    # =========================================================================
    # SLIDE 9: Risks and safeguards*
    # =========================================================================
    slide9 = prs.slides[8]
    t9_shape = slide9.shapes.add_table(6, 3, Inches(0.5), Inches(1.6), Inches(9.0), Inches(3.2))
    t9 = t9_shape.table
    w9 = [Inches(1.8), Inches(3.0), Inches(4.2)]
    for i, w in enumerate(w9):
        t9.columns[i].width = w

    h9 = ["Risk Domain", "Potential Vulnerability", "Implemented Engineering Safeguard"]
    for i, title in enumerate(h9):
        cell = t9.cell(0, i)
        cell.text = title
        cell.fill.solid()
        cell.fill.fore_color.rgb = FOREST
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        set_font(p.runs[0], size_pt=9.5, bold=True, color=WHITE)

    rows9 = [
        ("Privacy & Sovereignty", "Leakage of sensitive health biometrics to cloud", "Local-First Enclave: 0 unauthorized network calls. Full compliance with UAE PDPL (Decree-Law No. 45/2021)."),
        ("Algorithmic Bias", "Inflexible targets for sick, elderly or shift workers", "Anti-Erosion Floor: Targets capped at 50% baseline. User can trigger 'Planned Pause' with zero penalty."),
        ("Black-Box AI Failure", "LLM hallucinations or toxic wellness advice", "Zero Runtime AI: 100% deterministic decision logic in open TypeScript. Every state transition is traceable."),
        ("Employer Misuse", "Workplace surveillance or punitive insurance deductions", "Non-Punitive Architecture: Data only accumulates positive active days; cannot be queried to deduct benefits."),
        ("Clinical Safety", "User misinterprets advice as clinical therapy", "Non-SaMD Boundary: Prominent regulatory disclaimer on every screen. Does not diagnose or prescribe therapy."),
    ]
    for r_idx, row in enumerate(rows9):
        for c_idx, val in enumerate(row):
            cell = t9.cell(r_idx + 1, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = WHITE if r_idx % 2 == 0 else LIGHT_BG
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT
            set_font(p.runs[0], size_pt=8.5, bold=(c_idx == 0), color=INK)

    # =========================================================================
    # SLIDE 10: Hardware requirements
    # =========================================================================
    slide10 = prs.slides[9]
    hw_cards = [
        ("📱 ZERO-COST UNIVERSAL COMPATIBILITY", 
         "• No Proprietary Hardware Required: No smart rings, specialized patches, or expensive sensors.\n"
         "• Progressive Web App (PWA): Runs on any device with a modern browser (iOS Safari, Android Chrome, Windows, macOS).\n"
         "• Smartphone Accelerometers: Can passively capture movement with zero additional purchase.", Inches(0.5)),
        ("⌚ SENSOR INTEGRATION ARCHITECTURE", 
         "• Commercial Wearable Sync: Integrates seamlessly via standard APIs:\n"
         "  Apple HealthKit, Android Health Connect, Fitbit, Garmin, WHOOP.\n"
         "• Manual Zero-Hardware Fallback:\n"
         "  Citizens without wearables can manually enter daily steps or sleep in under 5 seconds with zero barrier to entry.", Inches(5.15)),
    ]
    for title, desc, left in hw_cards:
        c = add_card(slide10, left, Inches(1.6), Inches(4.35), Inches(3.2))
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.2)
        p1 = tf.paragraphs[0]
        p1.space_after = Pt(8)
        r_th = p1.add_run()
        r_th.text = title + "\n"
        set_font(r_th, size_pt=11, bold=True, color=FOREST)

        p2 = tf.add_paragraph()
        r_desc = p2.add_run()
        r_desc.text = desc
        set_font(r_desc, size_pt=9.5, color=INK)

    # =========================================================================
    # SLIDE 11: Authentication & Guest Access Demonstration
    # =========================================================================
    slide11 = prs.slides[10]
    cg = add_card(slide11, Inches(0.5), Inches(1.6), Inches(9.0), Inches(3.2))
    tf_g = cg.text_frame
    tf_g.word_wrap = True
    tf_g.margin_left = tf_g.margin_right = tf_g.margin_top = tf_g.margin_bottom = Inches(0.2)

    p_gh = tf_g.paragraphs[0]
    p_gh.space_after = Pt(6)
    r_gh = p_gh.add_run()
    r_gh.text = "⚡ ZERO-BARRIER GUEST ACCESS & 90-SECOND JUDGE DEMO MODE\n"
    set_font(r_gh, size_pt=12, bold=True, color=FOREST)

    guest_text = (
        "• Requirement Met (Continue as Guest):\n"
        "  WellSync requires NO login, password, or phone number. All features are 100% accessible to guest users immediately upon loading.\n\n"
        "• 1-Click '⚡ Judge Demo (90s)' Button in Navigation Bar:\n"
        "  Permanently embedded in the header. Instantly loads Tariq's 21-Day Clinical Telemetry Walkthrough:\n"
        "    - Days 1–14: Steady 8,500-step baseline establishing his 28-day median (Status: ON_TRACK).\n"
        "    - Days 15–17: 3-day night shift rotation dropping steps to 3,200 (Status: LAPSED — calm amber badge, zero streak reset).\n"
        "    - Days 18–20: 50% Minimum Target step-down (4,250 steps) + interactive micro-commitment (10-minute post-shift walk).\n"
        "    - Day 21: Recovery complete! Target restored, all 17 active days intact, and Return Count increments to 1.\n\n"
        "• Live Demonstration URL: http://localhost:5173/ | GitHub Repository: https://github.com/misterA-2406/well-sync"
    )
    p_gb = tf_g.add_paragraph()
    r_gb = p_gb.add_run()
    r_gb.text = guest_text
    set_font(r_gb, size_pt=9.5, color=INK)

    # =========================================================================
    # SLIDE 12: Path to pilot and scale*
    # =========================================================================
    slide12 = prs.slides[11]
    pilot_phases = [
        ("PHASE 1: CLINICAL PILOT (M1–M6)", "• N=300 SEHA / M42 healthcare shift workers\n• Validate Return Count & recovery velocity\n• Abu Dhabi DoH IRB clearance & oversight\n• Baseline vs control cohort testing", Inches(0.5)),
        ("PHASE 2: MALAFFI HIE (M7–M12)", "• Integration with Malaffi Health Information Exchange\n• Consented lifestyle summary export for primary care\n• Expansion to Abu Dhabi Government workplace programs\n• Arabic-first public health rollout", Inches(3.6)),
        ("PHASE 3: VALUE-BASED PAYER (YEAR 2+)", "• Daman & National Health Insurance partnerships\n• Premium wellness incentives based on Return Counts\n• Integration with national fitness apps (Abu Dhabi 360)\n• Long-term cardiovascular risk reduction", Inches(6.7)),
    ]
    for title, desc, left in pilot_phases:
        c = add_card(slide12, left, Inches(1.6), Inches(2.8), Inches(3.2))
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.15)
        p1 = tf.paragraphs[0]
        p1.space_after = Pt(8)
        r_th = p1.add_run()
        r_th.text = title + "\n"
        set_font(r_th, size_pt=10, bold=True, color=FOREST)

        p2 = tf.add_paragraph()
        r_desc = p2.add_run()
        r_desc.text = desc
        set_font(r_desc, size_pt=9.5, color=INK)

    # =========================================================================
    # SLIDE 13: Pre-existing IP and third-party materials*
    # =========================================================================
    slide13 = prs.slides[12]
    t13_shape = slide13.shapes.add_table(5, 4, Inches(0.5), Inches(1.6), Inches(9.0), Inches(3.2))
    t13 = t13_shape.table
    w13 = [Inches(2.2), Inches(2.2), Inches(1.8), Inches(2.8)]
    for i, w in enumerate(w13):
        t13.columns[i].width = w

    h13 = ["Component / Material", "Ownership / Author", "License", "Usage & Legal Restrictions"]
    for i, title in enumerate(h13):
        cell = t13.cell(0, i)
        cell.text = title
        cell.fill.solid()
        cell.fill.fore_color.rgb = FOREST
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        set_font(p.runs[0], size_pt=9.5, bold=True, color=WHITE)

    rows13 = [
        ("WellSync Core Engine & UI", "Ayesha Sultana & B. Alence", "MIT License", "Original source code; unrestricted academic & prototype use."),
        ("LifeSnaps Wearable Dataset", "Sofia Yfantidou et al. (2022)", "CC BY 4.0", "Open science benchmark replay with verified academic citation."),
        ("React 19, TypeScript, Tailwind", "Meta, Microsoft, Tailwind Labs", "MIT License", "Core application frontend framework and styling."),
        ("Commercial Disclaimer", "WellSync Contributors", "Trademark Notice", "Student prototype, not affiliated with commercial WellSync product."),
    ]
    for r_idx, row in enumerate(rows13):
        for c_idx, val in enumerate(row):
            cell = t13.cell(r_idx + 1, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = WHITE if r_idx % 2 == 0 else LIGHT_BG
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.CENTER if c_idx == 2 else PP_ALIGN.LEFT
            set_font(p.runs[0], size_pt=8.5, bold=(c_idx == 0), color=INK)

    # =========================================================================
    # SLIDE 14: Conflict of interest declaration*
    # =========================================================================
    slide14 = prs.slides[13]
    coi_card = add_card(slide14, Inches(0.5), Inches(1.6), Inches(9.0), Inches(3.2))
    tf_coi = coi_card.text_frame
    tf_coi.word_wrap = True
    tf_coi.margin_left = tf_coi.margin_right = tf_coi.margin_top = tf_coi.margin_bottom = Inches(0.2)

    p_coi_h = tf_coi.paragraphs[0]
    p_coi_h.space_after = Pt(10)
    r_coi_h = p_coi_h.add_run()
    r_coi_h.text = "OFFICIAL CONFLICT OF INTEREST DECLARATION\n"
    set_font(r_coi_h, size_pt=12, bold=True, color=FOREST)

    coi_text = (
        "The team members (Ayesha Sultana and B. Alence) hereby formally declare that:\n\n"
        "1. We have no financial, commercial, employment, or advisory relationships with challenge organizers (Future Health, Hack2Skill).\n\n"
        "2. We have no conflicts of interest or undisclosed affiliations with challenge co-creators or collaborators: Microsoft, Inception 42, or Mohamed bin Zayed University of Artificial Intelligence (MBZUAI).\n\n"
        "3. We have no personal, professional, or academic ties to any member of the judging panel or evaluation committee.\n\n"
        "4. WellSync was conceived, architected, and engineered independently as an academic competition submission for the Future Health Digital Innovation Challenge 2026."
    )
    p_coi_b = tf_coi.add_paragraph()
    r_coi_b = p_coi_b.add_run()
    r_coi_b.text = coi_text
    set_font(r_coi_b, size_pt=10.5, color=INK)

    # =========================================================================
    # SLIDE 15: Additional Slide — UAE Context Engine Deep-Dive
    # =========================================================================
    slide15 = prs.slides[14]
    # Update title
    for s in slide15.shapes:
        if s.has_text_frame and "Additional Slide" in s.text:
            s.text = "UAE Context Engine: Cultural & Climate Intelligence"
            p = s.text_frame.paragraphs[0]
            set_font(p.runs[0], size_pt=18, bold=True, color=FOREST)

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
        top = Inches(1.6) if idx < 2 else Inches(3.3)
        c = add_card(slide15, left, top, Inches(4.35), Inches(1.5))
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.12)
        p1 = tf.paragraphs[0]
        p1.space_after = Pt(4)
        r_th = p1.add_run()
        r_th.text = title + "\n"
        set_font(r_th, size_pt=10, bold=True, color=FOREST)

        p2 = tf.add_paragraph()
        r_desc = p2.add_run()
        r_desc.text = desc
        set_font(r_desc, size_pt=8.5, color=INK)

    # =========================================================================
    # SLIDE 16: Thank You / Closing
    # =========================================================================
    slide16 = prs.slides[15]
    ty_card = add_card(slide16, Inches(1.0), Inches(2.8), Inches(8.0), Inches(1.8))
    tf_ty = ty_card.text_frame
    tf_ty.word_wrap = True
    tf_ty.margin_left = tf_ty.margin_right = tf_ty.margin_top = tf_ty.margin_bottom = Inches(0.15)

    p_ty1 = tf_ty.paragraphs[0]
    p_ty1.alignment = PP_ALIGN.CENTER
    r_ty1 = p_ty1.add_run()
    r_ty1.text = "WellSync: Progress is Not Perfection. Recovery is Easier Than Restarting.\n"
    set_font(r_ty1, size_pt=13, bold=True, color=FOREST)

    p_ty2 = tf_ty.add_paragraph()
    p_ty2.alignment = PP_ALIGN.CENTER
    p_ty2.space_before = Pt(4)
    r_ty2 = p_ty2.add_run()
    r_ty2.text = (
        "Authors: 1. Ayesha Sultana & 2. B. Alence  |  Challenge 09: Sustaining Healthy Behaviors\n"
        "GitHub: https://github.com/misterA-2406/well-sync  |  Interactive Demo: http://localhost:5173/\n"
        "Demo Video (1080p MP4 + Neural Audio): docs/videos/wellsync_demo_final.mp4"
    )
    set_font(r_ty2, size_pt=9.5, color=INK)

    # Save
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    prs.save(OUTPUT_PATH)
    prs.save(COPY_PATH)
    print(f"\n🎉 Successfully saved filled PowerPoint presentation:")
    print(f"   1. {OUTPUT_PATH}")
    print(f"   2. {COPY_PATH}")

if __name__ == "__main__":
    main()
