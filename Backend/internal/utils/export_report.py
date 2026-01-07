from docx2pdf import convert
from docx import Document

import os

def ExportReport():
    cwd =  os.getcwd()
    inputFile = os.path.join(cwd, "internal/utils/input.docx")
    outputFile = os.path.join(cwd, "internal/utils/report.pdf")
    convert(inputFile, outputFile)
