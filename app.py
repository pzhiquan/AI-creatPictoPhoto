from flask import Flask, request, jsonify
from diffusers import StableDiffusionPipeline
import torch
import base64
from io import BytesIO
import oss2

app = Flask(__name__)

# 加载模型
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16)
pipe = pipe.to("cuda")  # 使用GPU

# OSS 配置
access_key_id = '你的AccessKeyId'
access_key_secret = '你的AccessKeySecret'
bucket_name = '你的Bucket名称'
endpoint = '你的OSS Endpoint'

auth = oss2.Auth(access_key_id, access_key_secret)
bucket = oss2.Bucket(auth, endpoint, bucket_name)

@app.route('/generate', methods=['POST'])
def generate_image():
    data = request.json
    prompt = data.get('prompt', 'A painting of a cat in the style of Van Gogh')
    image = pipe(prompt).images[0]

    # 将图像转换为Base64
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    # 上传到OSS
    object_name = f"generated/{prompt.replace(' ', '_')}.png"
    bucket.put_object(object_name, buffered.getvalue())

    return jsonify({'image': f"data:image/png;base64,{img_str}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 