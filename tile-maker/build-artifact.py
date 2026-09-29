# Rebuilds _artifact_tile_maker.html (the hosted build) from kai-social-tile-maker.html.
# Run the render suite first:  node _rendertest.js
import re
src=open('kai-social-tile-maker.html',encoding='utf-8').read()
old=open('_artifact_tile_maker.html',encoding='utf-8').read()
link=old.split('<style>')[0]
banner=re.search(r'<div id="fontWarn".*?</div>\s*',old,re.S).group(0)
tail=old[old.rindex('setTimeout(() => {'):old.rindex('</script>')]
style=re.search(r'<style>(.*?)</style>',src,re.S).group(1)
body=re.search(r'<body[^>]*>(.*)</body>',src,re.S).group(1)
script=re.search(r'<script>(.*)</script>',body,re.S).group(1)
body_html=body[:body.index('<script>')]
body_html=re.sub(r'(</header>)',lambda m:m.group(1)+'\n'+banner,body_html,count=1)
out=link+'<style>:root{color-scheme:light}\n'+style+'</style>\n'+body_html+'<script>'+script+'\n\n'+tail+'</script>'
def esc(seg,js): return ''.join(ch if ord(ch)<128 else (('\\u%04x'%ord(ch)) if js else ('&#%d;'%ord(ch))) for ch in seg)
parts=re.split(r'(<script>.*?</script>)',out,flags=re.S)
out=''.join(esc(p,p.startswith('<script>')) for p in parts)
open('_artifact_tile_maker.html','w',encoding='ascii').write(out)
print('artifact build', len(out), 'bytes')
