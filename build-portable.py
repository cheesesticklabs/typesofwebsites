from pathlib import Path
import base64,json
root=Path(__file__).resolve().parent
p=root/'lab'
s=(p/'index.html').read_text(encoding='utf-8-sig')
for name in ['styles.css','fix-site.css','annotator.css']:
    s=s.replace('<link rel="stylesheet" href="'+name+'">','<style>\n'+(p/name).read_text(encoding='utf-8-sig')+'\n</style>')
logo='data:image/png;base64,'+base64.b64encode((p/'assets/cheesestick-labs.png').read_bytes()).decode()
s=s.replace('src="assets/cheesestick-labs.png"','src="'+logo+'"')
photo='data:image/jpeg;base64,'+base64.b64encode((p/'assets/dog.jpg').read_bytes()).decode()
s=s.replace('<script src="fix-site.js">','<script>window.DOG_PHOTO='+json.dumps(photo)+';</script><script src="fix-site.js">')
for name in ['lesson.js','fix-site.js','annotation-archive.js','website-pages.js','annotator.js','purpose.js','app.js']:
    s=s.replace('<script src="'+name+'"></script>','<script>\n'+(p/name).read_text(encoding='utf-8-sig')+'\n</script>')
(root/'Website-purpose-lab.html').write_text(s,encoding='utf-8')
print('Built Website-purpose-lab.html')
