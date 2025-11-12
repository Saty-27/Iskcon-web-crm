#!/bin/bash

# Create simple colored rectangles as PNG files using ImageMagick-like approach
# Since we don't have ImageMagick, we'll create simple PPM files and convert them

# Temple colors for authentic feel
colors=("#8B4513" "#CD5C5C" "#A0522D" "#D2B48C" "#B22222" "#BC8F8F")
titles=("temple-main-hall" "sacred-deity-darshan" "prayer-ceremony" "festival-celebration" "temple-architecture" "devotional-gathering")

for i in {0..5}; do
  # Create a simple colored image using printf
  {
    echo "P3"
    echo "400 300"
    echo "255"
    
    # Convert hex to RGB
    color=${colors[$i]}
    r=$((16#${color:1:2}))
    g=$((16#${color:3:2}))
    b=$((16#${color:5:2}))
    
    # Create 400x300 pixels
    for ((y=0; y<300; y++)); do
      for ((x=0; x<400; x++)); do
        # Add some pattern variation
        if [[ $x -gt 150 && $x -lt 250 && $y -gt 100 && $y -lt 200 ]]; then
          # Lighter center area (like temple structure)
          echo $((r + 40)) $((g + 40)) $((b + 40))
        else
          echo $r $g $b
        fi
      done
    done
  } > "gallery-$(date +%s)${i}-${i}.ppm"
  
  echo "Created gallery-$(date +%s)${i}-${i}.ppm"
done
