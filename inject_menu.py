import os, glob
for html_file in glob.glob("*.html") + glob.glob("*/*.html") + glob.glob("*/*/*.html"):
    if not os.path.isfile(html_file): continue
    try:
        with open(html_file,'r',encoding='utf-8',errors='ignore') as f:
            content=f.read()
        if 'alwi_bubble_v4_MENU.js' in content: continue
        if '</body>' in content:
            inject='<script src="/alwi_bubble_v4_MENU.js"></script>\n</body>'
            content=content.replace('</body>',inject)
            with open(html_file,'w',encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {html_file}")
    except: pass
print("Selesai inject")
