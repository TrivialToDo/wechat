import matplotlib.pyplot as plt
from matplotlib.ticker import MultipleLocator

# 创建一个 Figure 对象和 Axes 对象
fig, ax = plt.subplots()

# # 画横向的实线
# ax.hlines(y=[1, 2, 3], xmin=0, xmax=3, colors='black', linewidth=2)

# # 画纵向的实线
# ax.vlines(x=[1, 2, 3], ymin=0, ymax=3, colors='black', linewidth=2)

# 设置坐标轴的刻度
ax.set_xticks([0, 1, 2, 3])
ax.set_yticks([0, 1, 2, 3])

# 设置坐标轴的范围
ax.set_xlim(0, 3)
ax.set_ylim(0, 3)

# 设置网格线的间距
x_major_locator = MultipleLocator(1.0)  # x 轴主要刻度间距为1
x_minor_locator = MultipleLocator(0.5)  # x 轴次要刻度间距为0.5
y_major_locator = MultipleLocator(0.5)  # y 轴主要刻度间距为0.5
y_minor_locator = MultipleLocator(0.25)  # y 轴次要刻度间距为0.2
ax.xaxis.set_major_locator(x_major_locator)
ax.xaxis.set_minor_locator(x_minor_locator)
ax.yaxis.set_major_locator(y_major_locator)
ax.yaxis.set_minor_locator(y_minor_locator)

# 添加网格
ax.grid(True, which='major', linewidth=1, alpha = 0.7)  # 添加主要刻度网格线
ax.grid(True, which='minor', linestyle='--', linewidth=1)  # 添加次要刻度网格线

# 显示图形
plt.show()
