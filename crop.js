import { Jimp } from 'jimp';

async function cropImage() {
  try {
    const image = await Jimp.read('public/website/images/logoroomhy.jpg');
    console.log(`Original Size: ${image.bitmap.width}x${image.bitmap.height}`);
    
    // 18.5% cut from left. 20% was cutting the 'R', so 18.5% should be the absolute limit
    // to remove the last sliver of the green icon.
    const cropX = Math.floor(image.bitmap.width * 0.185); 
    const cropY = Math.floor(image.bitmap.height * 0.05);
    const cropW = Math.floor(image.bitmap.width * 0.79);
    const cropH = Math.floor(image.bitmap.height * 0.62);
    
    image.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
    
    // Ensure background is white
    const finalImage = new Jimp({ width: cropW, height: cropH, color: 0xFFFFFFFF });
    finalImage.composite(image, 0, 0);
    
    await finalImage.write('public/website/images/logoroomhy_cropped.jpg');
    console.log('Cropped successfully with 18.5% left cut!');
  } catch (err) {
    console.error(err);
  }
}

cropImage();
