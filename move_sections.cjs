const fs = require('fs');

const content = fs.readFileSync('src/pages/PropertyDetail.tsx', 'utf8');

// Find the first grid
const grid1_start = content.indexOf('<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">');
const grid1_end = content.indexOf('</div>\n\n        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">', grid1_start);

// Find the second grid
const grid2_start = content.indexOf('<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">', grid1_end);
const grid2_end = content.indexOf('</div>\n\n        {/* Related Properties */}', grid2_start);

if (grid1_start !== -1 && grid2_start !== -1) {
    console.log("Found grids");
    
    // Extract the left column of grid 1
    const left1_start = content.indexOf('<div className="lg:col-span-2 space-y-8">', grid1_start);
    const left1_end = content.indexOf('</div>\n\n          <div className="lg:col-span-1', left1_start);
    const left1_content = content.substring(left1_start, left1_end + 6);
    
    // Extract the right column of grid 1
    const right1_start = content.indexOf('<div className="lg:col-span-1', left1_end);
    const right1_end = content.indexOf('</div>\n        </div>', right1_start);
    const right1_content = content.substring(right1_start, right1_end + 6);
    
    // Extract the left column of grid 2
    const left2_start = content.indexOf('<div className="lg:col-span-2 space-y-16">', grid2_start);
    const left2_end = content.indexOf('</div>\n\n          {/* Right Column: Sidebar */}', left2_start);
    const left2_content = content.substring(left2_start, left2_end + 6);
    
    // Extract the right column of grid 2
    const right2_start = content.indexOf('<div className="space-y-6">', left2_end);
    const right2_end = content.indexOf('</div>\n        </div>', right2_start);
    const right2_content = content.substring(right2_start, right2_end + 6);
    
    const left1_inner = left1_content.replace('<div className="lg:col-span-2 space-y-8">\n', '').replace(/<\/div>$/, '');
    const left2_inner = left2_content.replace('<div className="lg:col-span-2 space-y-16">\n', '').replace(/<\/div>$/, '');
    const right2_inner = right2_content.replace('<div className="space-y-6">\n', '').replace(/<\/div>$/, '');
    
    const new_grid = `<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 items-start">
          <div className="lg:col-span-2 space-y-16">
            <div className="space-y-8">
${left1_inner}            </div>
${left2_inner}          </div>

          <div className="lg:col-span-1 space-y-6 sticky top-32">
${right1_content.replace('lg:col-span-1 p-8', 'p-8')}
${right2_inner}          </div>
        </div>`;
        
    const new_content = content.substring(0, grid1_start) + new_grid + content.substring(grid2_end + 14);
    
    fs.writeFileSync('src/pages/PropertyDetail.tsx', new_content);
    console.log("Done");
} else {
    console.log("Grids not found");
}
