// HomePage.tsx
import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Divider, Modal, Text } from "rsuite";
import { AppDispatch, RootState } from "./redux/store";
import { Login } from "./Login";
import 'rsuite/Modal/styles/index.css';
import '../app/styles/globals.css';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button as AntButton } from 'antd';
import { createStyles } from 'antd-style';

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      border-width: 0;

      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));

export default function HomePageSet({ registerRef }) {
    const expand = useSelector((state: RootState) => state.expand.value);
    const dispatch = useDispatch<AppDispatch>();

    const registerClickHandle = () => {
        if (registerRef.current) {
            registerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const { styles } = useStyle();  // 获取渐变按钮样式

    return (
        <Container className="w-[80vw] h-[100vh] ml-[10vw] flex flex-col items-center justify-center">
            <Container
                className="font-black bg-gradient-to-r from-[#43dfb2] via-[#00e2ff] to-[#d8b5ff] bg-clip-text [-webkit-text-fill-color:transparent]">
                <Text className="text-6xl text-center mb-[3vh]">XYwowNET</Text>
                <Text className="text-center">Powered by KohakuwuTech</Text>
            </Container>

            <Container className="mt-[5vh] w-80 font-black flex justify-evenly">
                <div style={{
                    marginTop: '5vh',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    fontWeight: 'bold',
                    gap: '20px'
                }}>
                    <AntButton
                        className={styles.linearGradientButton}  // 使用渐变按钮样式
                        icon={<LoginOutlined />}
                        onClick={handleOpen}
                    >
                        登录
                    </AntButton>
                    <AntButton
                        className={styles.linearGradientButton}  // 使用渐变按钮样式
                        icon={<UserAddOutlined />}
                        onClick={registerClickHandle}
                    >
                        注册
                    </AntButton>
                </div>
            </Container>

            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Text className="font-black text-2xl">登录</Text>
                </Modal.Header>
                <Modal.Body>
                    <Login />
                </Modal.Body>
            </Modal>
        </Container>
    );
}
