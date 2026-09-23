"""
invoicing.py - Non-GST PDF invoice generator using ReportLab.
Generates an executive, branded Bill of Supply / Service Invoice for brokerage clients.
"""

import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from typing import Dict, Any

def generate_pdf_invoice(batch_info: Dict[str, Any], 
                         client_info: Dict[str, Any],
                         invoice_number: str,
                         invoice_date: str,
                         flat_fee: float,
                         payment_status: str = "Unpaid") -> io.BytesIO:
    """
    Generates a PDF invoice using ReportLab and returns an in-memory BytesIO buffer.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0F172A") # Deep Navy
    gold_color = colors.HexColor("#D97706")    # Rich Amber / Gold
    slate_muted = colors.HexColor("#475569")
    light_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=primary_color,
        leading=26
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=slate_muted,
        leading=13
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=gold_color,
        leading=15,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        textColor=primary_color,
        leading=14
    )
    
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        textColor=primary_color,
        leading=14
    )

    status_style = ParagraphStyle(
        'StatusTag',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor("#15803D") if payment_status.lower() == "paid" else colors.HexColor("#B91C1C"),
        leading=14
    )

    elements = []

    # 1. Header with branding & Invoice Metadata
    header_data = [
        [
            Paragraph("<b>YAGHAR ADVISORY</b><br/><font color='#D97706'>Dead-Lead Reactivation Service</font>", title_style),
            Paragraph(f"<b>BILL OF SUPPLY</b><br/><font size=9 color='#475569'>NON-GST SERVICE INVOICE</font><br/><b>Invoice No:</b> {invoice_number}<br/><b>Date:</b> {invoice_date}", ParagraphStyle('RightHeader', parent=styles['Normal'], alignment=2, leading=14, fontSize=10))
        ]
    ]
    t_header = Table(header_data, colWidths=[3.5*inch, 3.8*inch])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10)
    ]))
    elements.append(t_header)

    elements.append(HRFlowable(width="100%", thickness=1.5, color=gold_color, spaceBefore=4, spaceAfter=14))

    # 2. Bill To & Service Details Box
    client_name = client_info.get("name", "Client")
    client_contact = client_info.get("contact", "")
    corridor = client_info.get("corridor", "Central Mumbai")
    batch_name = batch_info.get("batch_name", "Batch")

    client_details = f"""
    <b>Billed To:</b><br/>
    <b>{client_name}</b><br/>
    Focus Corridor: {corridor}<br/>
    Contact: {client_contact if client_contact else 'On Record'}
    """

    service_meta = f"""
    <b>Service Particulars:</b><br/>
    <b>Batch Ref:</b> {batch_name}<br/>
    <b>Deliverable:</b> Cleaned & Scored Leads with Hinglish Scripts<br/>
    <b>Payment Status:</b> <font color='{"#15803D" if payment_status.lower() == "paid" else "#B91C1C"}'><b>{payment_status.upper()}</b></font>
    """

    meta_table_data = [
        [Paragraph(client_details, body_style), Paragraph(service_meta, body_style)]
    ]
    t_meta = Table(meta_table_data, colWidths=[3.7*inch, 3.6*inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP')
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 16))

    # 3. Line Items Table
    item_header = [
        Paragraph("<b>Sr.</b>", body_bold),
        Paragraph("<b>Description of Service</b>", body_bold),
        Paragraph("<b>Corridor / Batch</b>", body_bold),
        Paragraph("<b>Amount (INR)</b>", ParagraphStyle('RightBold', parent=body_bold, alignment=2))
    ]

    item_row_1 = [
        Paragraph("1", body_style),
        Paragraph(f"<b>Dead-Lead Reactivation Engine & Delivery Package</b><br/><font size=8 color='#475569'>• Raw list intake and duplicate phone normalization (+91 standardization)<br/>• Algorithmic lead qualification & scoring (Recency, Source, Corridor fit)<br/>• Hot / Warm / Cold segmentation with customized Hinglish call scripts<br/>• Client delivery Excel sheet & tracking protocol</font>", body_style),
        Paragraph(f"{corridor}<br/><font size=8 color='#475569'>{batch_name}</font>", body_style),
        Paragraph(f"₹ {flat_fee:,.2f}", ParagraphStyle('RightPrice', parent=body_style, alignment=2))
    ]

    total_row = [
        "",
        Paragraph("<b>Total Amount Payable (Exempt / Non-GST):</b>", ParagraphStyle('RightBoldTot', parent=body_bold, alignment=2)),
        "",
        Paragraph(f"<b>₹ {flat_fee:,.2f}</b>", ParagraphStyle('RightPriceTot', parent=body_bold, alignment=2, textColor=gold_color, fontSize=11))
    ]

    items_table = Table([item_header, item_row_1, total_row], colWidths=[0.5*inch, 4.3*inch, 1.3*inch, 1.2*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-2), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BACKGROUND', (0,-1), (-1,-1), light_bg),
        ('LINEABOVE', (0,-1), (-1,-1), 1.5, primary_color)
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 18))

    # 4. Non-GST Compliance Declaration & Bank Details
    declaration_text = """
    <b>Statutory Non-GST Declaration:</b><br/>
    This document is a <i>Bill of Supply / Non-GST Service Invoice</i> issued under the provisions of the 
    Central Goods and Services Tax (CGST) Act, 2017. As the service provider's aggregate turnover is below 
    the mandatory threshold prescribed under Section 22 of the CGST Act, no GST is collected or applicable.
    """
    elements.append(Paragraph(declaration_text, subtitle_style))
    elements.append(Spacer(1, 12))

    # Payment info box
    bank_info = """
    <b>Payment Options:</b><br/>
    • <b>UPI ID:</b> <code>reactivation.desk@okhdfcbank</code><br/>
    • <b>Beneficiary:</b> YAGHAR Consulting & Lead Advisory<br/>
    • <b>Bank / IFSC:</b> HDFC Bank / HDFC0001234<br/>
    • <b>Terms:</b> Payment due within 7 days of delivery.
    """
    
    auth_sign = """
    <br/><br/>
    <b>For YAGHAR Advisory Services</b><br/>
    <i>Authorized Signatory</i>
    """

    bottom_table = Table([
        [Paragraph(bank_info, body_style), Paragraph(auth_sign, ParagraphStyle('RightSign', parent=body_style, alignment=2))]
    ], colWidths=[4.5*inch, 2.8*inch])
    bottom_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    elements.append(bottom_table)

    doc.build(elements)
    buffer.seek(0)
    return buffer
