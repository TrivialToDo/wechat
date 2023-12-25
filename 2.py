import matplotlib.pyplot as plt
from datetime import timedelta, datetime

class Event:
    def __init__(self, start_time, end_time, title, start_date, end_date):
        self.dateStart = start_date
        self.dateEnd = end_date
        self.title = title
        self.timeStart = start_time
        self.timeEnd = end_time

events:list[Event] = []
for i in range(7):
    date = datetime.now().date()
    date = date + timedelta(days=i)
    

def cal_y(time: datetime.time, height_total):
    print(time.hour, time.minute, time.second)
    hour = time.hour + time.minute / 60 + time.second / 3600
    print(hour)
    return height_total * (1 - hour / 24)


days = 7
total_height = 24
# 创建一个图形
fig, ax = plt.subplots()

# 获取当前日期
current_date = datetime.now().date()
date2 = current_date + timedelta(days=days)
for event in events:
    if event.dateStart >= current_date and event.dateStart < date2:
        if(event.dateStart == event.dateEnd):
            x = (event.dateStart - current_date).days
            width = 1
            y = cal_y(event.timeStart, total_height)
            height = cal_y(event.timeEnd, total_height) - cal_y(event.timeStart, total_height)
            # print(x, width, y, height)
            rectangle = plt.Rectangle((x, y), width, height, edgecolor='black', facecolor='cyan')

            # 将方块添加到图形中
            ax.add_patch(rectangle)
            chinese_text = event.title

            # 在方块中间添加中文字符
            text_x = x + width / 2
            text_y = y + height / 2

            # 添加中文文本
            ax.text(text_x, text_y, chinese_text, ha='center', va='center')

# 设置坐标轴范围
ax.set_xlim(0, days)
ax.set_ylim(0, total_height)

# 设置坐标轴标签
ax.set_xlabel('date')
ax.set_ylabel('hour')
ax.set_yticks(range(0, 25, 4))
plt.gca().invert_yaxis()
x_tick_labels = [""]
date0 = current_date.strftime('%m/%d')
for i in range(7):
    x_tick_labels.append((str)(current_date + timedelta(days=i)))
ax.set_xticklabels(x_tick_labels, rotation=-10, ha='right')

# 设置图形标题
ax.set_title('schedulers in a week')