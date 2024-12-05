import {Form, Button, FlexboxGrid, Input, Text, Container} from 'rsuite';
import React, { useState } from 'react';
import forge from 'node-forge';
import 'rsuite/input/styles/index.css'
import {useRouter} from "next/navigation";

const url="https://api.xywow.studio:12060";

export const Login = () => {
    const [userId, setUserId] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg,setErrMsg] = useState('');
    const [errMsgIsShow,setErrMsgIsShow] = useState(false);
    const router=useRouter();
    async function handleSubmit() {
        try {
            console.log(userId);
            console.log(pwd);
            const res = await fetch(url + `/auth/public-key?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId })
            }); // Changed route to /auth/public-key
            const publicKeyData = await res.json();
            if(res.status===404){
                setErrMsg("用户不存在")
                setErrMsgIsShow(true)
                return;
            }
            let publicKeyPem,publicKey,encryptedPwd,encryptedPwdBase64;
            if(publicKeyData.publicKey){
                publicKeyPem = publicKeyData.publicKey;
                publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
                encryptedPwd = publicKey.encrypt(pwd, 'RSA-OAEP');
                encryptedPwdBase64 = forge.util.encode64(encryptedPwd);
            }
            const loginResponse = await fetch(url+'/auth/login', { // Changed route to /auth/login
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    encryptedPwd: encryptedPwdBase64
                }),
                credentials: 'include' // IMPORTANT !! This is needed to save the session cookie !!!
            });
            console.log(loginResponse.status)
            if(loginResponse.status===200){
                setErrMsg("登录成功!")
                setErrMsgIsShow(true)
                await router.push('/dashboard')
            }
            else if(loginResponse.status===401){
                setErrMsg("密码错误!")
                setErrMsgIsShow(true)
            }
        }catch (error) {
            console.error('Error:', error);
            setErrMsg("登录失败!")
            setErrMsgIsShow(true)
        }
    }
    return (
        <FlexboxGrid className='font-black'>
            <FlexboxGrid.Item colspan={12}>
                <Form>
                    <Text>QQ号</Text>
                    <Input name="userId" className='mt-2' onChange={setUserId} value={userId}/>
                    <br/>
                    <Text>密码</Text>
                    <Input name="pwd" className='mt-2' onChange={setPwd} value={pwd}/>
                    <br/>
                    <Container className={"flex items-center justify-left"}>
                        <Button onClick={handleSubmit} className='px-3 py-2 rounded-xl bg-blue-400'>LOGIN</Button>
                        <Text hidden={!errMsgIsShow} className='px-3 py-2 text-red-300'>{errMsg}</Text>
                    </Container>
                </Form>
            </FlexboxGrid.Item>
        </FlexboxGrid>
    );
};