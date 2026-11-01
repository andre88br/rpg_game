import sys, numpy as np, cv2
from PIL import Image
im = cv2.imread(sys.argv[1])
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
mask = np.zeros(im.shape[:2], np.uint8)
# a citação: letras claras (brancas e creme) na caixa do texto
# a caixa do texto a apagar (x0 y0 x1 y1), da imagem do Saci; troque por imagem
x0, y0, x1, y1 = [int(v) for v in sys.argv[3:7]] if len(sys.argv) > 6 else (110, 285, 300, 450)
reg = hsv[y0:y1, x0:x1]
claro = (reg[..., 2] > 150) & (reg[..., 1] < 110)
mask[y0:y1, x0:x1][claro] = 255
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=2)
limpa = cv2.inpaint(im, mask, 7, cv2.INPAINT_TELEA)
cv2.imwrite(sys.argv[2], limpa)
cv2.imwrite(sys.argv[2].replace('.png', '_mascara.png'), mask)
print('pixels de texto', int((mask > 0).sum()))
