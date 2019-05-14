im = double(imread('assets/images/1978.jpg'));
inputRed= im(:,:,1);
inputGreen = im(:,:,2);
inputBlue = im(:,:,3);
outputRed=(inputRed * .393) + (inputGreen *.769) + (inputBlue *.189);
outputGreen=(inputRed *.349) +(inputGreen *.686) + (inputBlue *.168);
outputBlue=(inputRed *.272) + (inputGreen *.534) + (inputBlue *.131);

out = uint8(cat(3, outputRed, outputGreen, outputBlue));

 
figure;
imshow(im,[]);
figure;
imshow(out);