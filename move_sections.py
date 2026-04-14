import re

with open('src/pages/PropertyDetail.tsx', 'r') as f:
    content = f.read()

# Find the first grid
grid1_start = content.find('<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">')
grid1_end = content.find('</div>\n\n        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">', grid1_start)

# Find the second grid
grid2_start = content.find('<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">', grid1_end)
grid2_end = content.find('</div>\n\n        {/* Related Properties */}', grid2_start)

if grid1_start != -1 and grid2_start != -1:
    print("Found grids")
    
    # Extract the left column of grid 1
    left1_start = content.find('<div className="lg:col-span-2 space-y-8">', grid1_start)
    left1_end = content.find('</div>\n\n          <div className="lg:col-span-1', left1_start)
    left1_content = content[left1_start:left1_end + 6]
    
    # Extract the right column of grid 1
    right1_start = content.find('<div className="lg:col-span-1', left1_end)
    right1_end = content.find('</div>\n        </div>', right1_start)
    right1_content = content[right1_start:right1_end + 6]
    
    # Extract the left column of grid 2
    left2_start = content.find('<div className="lg:col-span-2 space-y-16">', grid2_start)
    left2_end = content.find('</div>\n\n          {/* Right Column: Sidebar */}', left2_start)
    left2_content = content[left2_start:left2_end + 6]
    
    # Extract the right column of grid 2
    right2_start = content.find('<div className="space-y-6">', left2_end)
    right2_end = content.find('</div>\n        </div>', right2_start)
    right2_content = content[right2_start:right2_end + 6]
    
    left1_inner = left1_content.replace('<div className="lg:col-span-2 space-y-8">\n', '', 1)
    left1_inner = left1_inner.rsplit('</div>', 1)[0]
    
    left2_inner = left2_content.replace('<div className="lg:col-span-2 space-y-16">\n', '', 1)
    left2_inner = left2_inner.rsplit('</div>', 1)[0]
    
    right2_inner = right2_content.replace('<div className="space-y-6">\n', '', 1)
    right2_inner = right2_inner.rsplit('</div>', 1)[0]
    
    new_grid = f'''<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 items-start">
          <div className="lg:col-span-2 space-y-16">
            <div className="space-y-8">
{left1_inner}            </div>
{left2_inner}          </div>

          <div className="lg:col-span-1 space-y-6 sticky top-32">
{right1_content.replace('lg:col-span-1 p-8', 'p-8')}
{right2_inner}          </div>
        </div>'''
        
    new_content = content[:grid1_start] + new_grid + content[grid2_end + 14:]
    
    with open('src/pages/PropertyDetail.tsx', 'w') as f:
        f.write(new_content)
    print("Done")
else:
    print("Grids not found")
