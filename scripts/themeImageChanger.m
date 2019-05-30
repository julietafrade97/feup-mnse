
s=51;
year=1968;
for i=1:s
    
    imagePath= ['assets/images/' num2str(year) '.jpg'];    
    imOriginal = imread(imagePath);
    im = (rgb2gray(imOriginal));

    layerOne =(cat(3,im.*.886,im.*.478,im.*.247));
    layer = layerOne;
    
    baseFileName = [num2str(year) '.jpg'];
    fullFileName = fullfile('assets/themeImages', baseFileName);
    imwrite(layer, fullFileName);
    year=year+1;    

end