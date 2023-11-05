# 使用官方 Node.js 镜像作为基础镜像
FROM node:16

# 设置工作目录
WORKDIR /app

# 复制应用程序代码到工作目录
COPY . .

# 安装应用程序的依赖项
RUN npm install

# 暴露应用程序运行的端口（如果需要）
# EXPOSE 3000

# 定义启动应用程序的命令
CMD [ "npm", "start" ]
