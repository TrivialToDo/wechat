# ʹ�ùٷ� Node.js ������Ϊ��������
FROM node:16

# ���ù���Ŀ¼
WORKDIR /app

# ����Ӧ�ó�����뵽����Ŀ¼
COPY . .

# ��װӦ�ó����������
RUN npm install

# ��¶Ӧ�ó������еĶ˿ڣ������Ҫ��
# EXPOSE 3000

# ��������Ӧ�ó��������
CMD [ "npm", "start" ]
