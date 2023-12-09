# 使用官方 Node.js 镜像作为基础镜像
FROM node:16

# 设置工作目录
WORKDIR /app
ENV DOCKER=production
# 复制应用程序代码到工作目录
COPY . .

# 安装应用程序的依赖项
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org

# 暴露应用程序运行的端口（如果需要）
EXPOSE 3000

ENV WECHATY_PUPPET_PADLOCAL_TOKEN=puppet_padlocal_b3c8318facc840f3bd5b0ce62dcd0531
ENV WECHATY_PUPPET_SERVER_PORT=8788
ENV WECHATY_PUPPET=wechaty-puppet-padlocal
ENV WECHATY_LOG=verbose

# 定义启动应用程序的命令
CMD [ "npm", "start" ]
