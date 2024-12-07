'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import forge from 'node-forge';

const API_BASE_URL = 'https://api.xywow.studio'; // 如果不同，请更新

// VIP计算函数
function getVipLevel(consumption: number): number {
    const level = Math.floor(consumption / 50);
    return level > 100 ? 100 : level;
}

function getVipDiscountFactor(vipLevel: number): number {
    return 1.0 - (vipLevel * 0.005);
}

const TestPage: React.FC = () => {
    // 状态变量定义

    // 1. Get Key Tester
    const [userIdForKey, setUserIdForKey] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [getKeyResponse, setGetKeyResponse] = useState<any>(null);
    const [getKeyError, setGetKeyError] = useState<string | null>(null);

    // 2. Login Tester
    const [loginTesterUserId, setLoginTesterUserId] = useState('');
    const [loginTesterPassword, setLoginTesterPassword] = useState('');
    const [loginTesterResponse, setLoginTesterResponse] = useState<any>(null);
    const [loginTesterError, setLoginTesterError] = useState<string | null>(null);

    // 3. Existing Login
    const [password, setPassword] = useState('');
    const [loginResponse, setLoginResponse] = useState<any>(null);
    const [loginError, setLoginError] = useState<string | null>(null);

    // 4. Whitelist Management
    const [whitelistUserId, setWhitelistUserId] = useState('');
    const [whitelistAction, setWhitelistAction] = useState<'add' | 'remove'>('add');
    const [whitelistResponse, setWhitelistResponse] = useState<any>(null);
    const [whitelistError, setWhitelistError] = useState<string | null>(null);

    // 5. User Creation
    const [createUserData, setCreateUserData] = useState({ userId: '', username: '' });
    const [createUserResponse, setCreateUserResponse] = useState<any>(null);
    const [createUserError, setCreateUserError] = useState<string | null>(null);

    // 6. User Information
    const [userInfo, setUserInfo] = useState<any>(null);
    const [userInfoError, setUserInfoError] = useState<string | null>(null);

    // 7. Prisma Table Data
    const [prismaTable, setPrismaTable] = useState('');
    const [prismaData, setPrismaData] = useState<any>(null);
    const [prismaError, setPrismaError] = useState<string | null>(null);

    // 8. Logout
    const [logoutResponse, setLogoutResponse] = useState<any>(null);
    const [logoutError, setLogoutError] = useState<string | null>(null);

    // 9. Consumption Calculator
    const [enterTimestamp, setEnterTimestamp] = useState<string>('');
    const [estimatedResult, setEstimatedResult] = useState<{ playTimeStr: string; cost: number } | null>(null);
    const [consumptionError, setConsumptionError] = useState<string | null>(null);

    // 10. Discount (折扣) 状态变量
    const [discount, setDiscount] = useState<number>(1); // 默认无额外折扣

    // 辅助函数：处理 API 请求
    const handleRequest = async (
        method: 'GET' | 'POST' | 'DELETE',
        endpoint: string,
        data?: any,
        onSuccess?: (data: any) => void,
        onError?: (error: string) => void
    ) => {
        try {
            const res = await axios({
                method,
                url: `${API_BASE_URL}${endpoint}`,
                data,
                withCredentials: true,
            });

            if (onSuccess) {
                onSuccess(res.data);
            }
        } catch (err: any) {
            if (onError) {
                if (err.response && err.response.data && err.response.data.error) {
                    onError(err.response.data.error);
                } else {
                    onError(err.message);
                }
            }
        }
    };

    const fetchPublicKey = async () => {
        if (!userIdForKey) {
            alert('请输入 User ID 来获取公钥。');
            return;
        }

        await handleRequest(
            'POST',
            '/auth/public-key',
            { userId: userIdForKey },
            (data) => {
                if (data && data.publicKey) {
                    setPublicKey(data.publicKey);
                    setGetKeyResponse('公钥获取成功。');
                    setGetKeyError(null);
                } else if (data && data.error) {
                    setPublicKey('');
                    setGetKeyError(data.error);
                    alert(`获取公钥错误: ${data.error}`);
                } else {
                    setPublicKey('');
                    setGetKeyError('意外的响应结构。');
                    alert('意外的响应结构。');
                }
            },
            (error) => {
                setPublicKey('');
                setGetKeyError(error);
                alert(`获取公钥错误: ${error}`);
            }
        );
    };

    const encryptPassword = (pwd: string, pubKey: string): string => {
        try {
            const publicKey = forge.pki.publicKeyFromPem(pubKey);
            const encrypted = publicKey.encrypt(forge.util.encodeUtf8(pwd), 'RSA-OAEP');
            return forge.util.encode64(encrypted);
        } catch (error) {
            console.error('加密错误:', error);
            alert('密码加密失败。');
            return '';
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userIdForKey || !password || !publicKey) {
            alert('请确保已获取公钥并输入密码。');
            return;
        }

        const encryptedPwd = encryptPassword(password, publicKey);
        if (!encryptedPwd) {
            return;
        }

        await handleRequest(
            'POST',
            '/auth/login',
            { userId: userIdForKey, encryptedPwd },
            (data) => {
                if (data && data.message) {
                    setLoginResponse(data.message);
                    setLoginError(null);
                    alert('登录成功。');
                } else {
                    setLoginResponse(null);
                    setLoginError('来自服务器的意外响应。');
                    alert('来自服务器的意外响应。');
                }
            },
            (error) => {
                setLoginResponse(null);
                setLoginError(error);
                alert(`登录失败: ${error}`);
            }
        );
    };

    const handleLoginTester = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginTesterUserId || !loginTesterPassword) {
            alert('请同时输入 User ID 和密码。');
            return;
        }

        try {
            const res = await axios.post(
                `${API_BASE_URL}/auth/public-key`,
                { userId: loginTesterUserId },
                { withCredentials: true }
            );

            if (res.data && res.data.publicKey) {
                const fetchedPublicKey = res.data.publicKey;

                const encryptedPwd = encryptPassword(loginTesterPassword, fetchedPublicKey);
                if (!encryptedPwd) {
                    setLoginTesterResponse(null);
                    setLoginTesterError('密码加密失败。');
                    return;
                }

                try {
                    const loginRes = await axios.post(
                        `${API_BASE_URL}/auth/login`,
                        { userId: loginTesterUserId, encryptedPwd },
                        { withCredentials: true }
                    );

                    if (loginRes.data && loginRes.data.message) {
                        setLoginTesterResponse(loginRes.data.message);
                        setLoginTesterError(null);
                        alert('Login Tester: 登录成功。');
                    } else {
                        setLoginTesterResponse(null);
                        setLoginTesterError('登录过程中来自服务器的意外响应。');
                        alert('Login Tester: 登录过程中来自服务器的意外响应。');
                    }
                } catch (loginErr: any) {
                    let errorMsg = 'Login Tester: ';
                    if (loginErr.response && loginErr.response.data && loginErr.response.data.error) {
                        errorMsg += loginErr.response.data.error;
                    } else {
                        errorMsg += loginErr.message;
                    }
                    setLoginTesterResponse(null);
                    setLoginTesterError(errorMsg);
                    alert(errorMsg);
                }
            } else {
                setLoginTesterResponse(null);
                setLoginTesterError('获取公钥失败。');
                alert('Login Tester: 获取公钥失败。');
            }
        } catch (err: any) {
            let errorMsg = 'Login Tester: ';
            if (err.response && err.response.data && err.response.data.error) {
                errorMsg += err.response.data.error;
            } else {
                errorMsg += err.message;
            }
            setLoginTesterResponse(null);
            setLoginTesterError(errorMsg);
            alert(errorMsg);
        }
    };

    const handleWhitelist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!whitelistUserId) {
            alert('请输入 User ID。');
            return;
        }

        const endpoint = '/auth/whitelist';
        const method = whitelistAction === 'add' ? 'POST' : 'DELETE';

        await handleRequest(
            method,
            endpoint,
            { userId: whitelistUserId },
            (data) => {
                setWhitelistResponse(data);
                setWhitelistError(null);
                alert(`白名单 ${whitelistAction === 'add' ? '添加' : '移除'} 成功。`);
            },
            (error) => {
                setWhitelistResponse(null);
                setWhitelistError(error);
                alert(`白名单 ${whitelistAction === 'add' ? '添加' : '移除'} 失败: ${error}`);
            }
        );
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const { userId, username } = createUserData;
        if (!userId || !username) {
            alert('请输入 User ID 和用户名。');
            return;
        }

        await handleRequest(
            'POST',
            '/auth/createUser',
            { userId, username },
            (data) => {
                setCreateUserResponse(data);
                setCreateUserError(null);
                alert(`用户 "${username}" 创建成功。`);
            },
            (error) => {
                setCreateUserResponse(null);
                setCreateUserError(error);
                alert(`用户创建失败: ${error}`);
            }
        );
    };

    const fetchUserInfo = async () => {
        await handleRequest(
            'GET',
            '/auth/user',
            null,
            (data) => {
                setUserInfo(data);
                setUserInfoError(null);
                setDiscount(data.discount || 1);
            },
            (error) => {
                setUserInfo(null);
                setUserInfoError(error);
                alert(`获取用户信息失败: ${error}`);
            }
        );
    };

    const fetchPrismaData = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prismaTable) {
            alert('请输入 Prisma 表名。');
            return;
        }

        await handleRequest(
            'GET',
            `/prisma/${prismaTable}`,
            null,
            (data) => {
                setPrismaData(data);
                setPrismaError(null);
            },
            (error) => {
                setPrismaData(null);
                setPrismaError(error);
                alert(`获取 Prisma 数据失败: ${error}`);
            }
        );
    };

    const handleLogout = async () => {
        await handleRequest(
            'POST',
            '/auth/logout',
            null,
            (data) => {
                setLogoutResponse(data);
                setLogoutError(null);
                alert('登出成功。');
            },
            (error) => {
                setLogoutResponse(null);
                setLogoutError(error);
                alert(`登出失败: ${error}`);
            }
        );
    };

    // 新的阶梯计费函数
    function calculateBaseCostByHours(hours: number): number {
        // 0-3小时：8元/小时
        // 3-6小时：6元/小时
        // 6-10小时：5元/小时
        // 超过10小时仍为5元/小时

        let cost = 0;
        for (let h = 1; h <= hours; h++) {
            if (h <= 3) {
                cost += 8;
            } else if (h <= 6) {
                cost += 6;
            } else {
                // 6小时后到10小时，以及超过10小时部分都为5元/小时
                cost += 5;
            }
        }
        return cost;
    }

    const handleConsumptionCalculation = (e: React.FormEvent) => {
        e.preventDefault();
        setEstimatedResult(null);
        setConsumptionError(null);

        if (!enterTimestamp) {
            setConsumptionError('请输入入店时间戳。');
            alert('请输入入店时间戳。');
            return;
        }

        const enterTs = parseInt(enterTimestamp, 10);
        if (isNaN(enterTs)) {
            setConsumptionError('入店时间戳必须是一个有效的数字。');
            alert('入店时间戳必须是一个有效的数字。');
            return;
        }

        const exitTime = BigInt(new Date().getTime());
        const enterTime = BigInt(enterTs);
        let playTimeMs = Number(exitTime - enterTime);

        if (playTimeMs < 0) playTimeMs = 0;

        const day = Math.floor(playTimeMs / (1000 * 60 * 60 * 24));
        playTimeMs -= day * (1000 * 60 * 60 * 24);
        const hour = Math.floor(playTimeMs / (1000 * 60 * 60));
        playTimeMs -= hour * (1000 * 60 * 60);
        const minute = Math.floor(playTimeMs / (1000 * 60));

        let playTimeStr = '';
        if (day > 0) playTimeStr += `${day}天 `;
        if (hour > 0) playTimeStr += `${hour}小时 `;
        if (minute > 0) playTimeStr += `${minute}分钟`;
        if (playTimeStr === '') playTimeStr = '不到1分钟';

        // 计算总小时数
        const totalHours = Math.ceil((Number(exitTime - enterTime)) / (1000 * 60 * 60));

        // 使用新的阶梯计费逻辑
        const baseCost = calculateBaseCostByHours(totalHours);

        // 应用VIP和额外discount
        const totalSpent = userInfo?.consumption || 0;
        const vipLevel = getVipLevel(totalSpent);
        const vipDiscountFactor = getVipDiscountFactor(vipLevel);

        const finalCost = baseCost * vipDiscountFactor * discount;

        setEstimatedResult({
            playTimeStr: playTimeStr.trim(),
            cost: finalCost,
        });

        alert(`游玩时间: ${playTimeStr.trim()}\n预计消费(测试计算): ￥${finalCost.toFixed(2)}`);
    };

    return (
        <div className="container">
            <h1>XYwow API Tester</h1>

            {/* 计费逻辑说明 */}
            <section>
                <h2>计费逻辑说明</h2>
                <p>
                    新的阶梯计费模式：
                    0-3小时：8元/小时
                    3-6小时：6元/小时
                    6-10小时：5元/小时
                    超过10小时：5元/小时（持续）
                </p>
                <p>VIP等级仍根据累计消费(consumption)计算，0~100级，每50元一级，每级降低0.5个点的折扣，从VIP0无折扣(1.0倍)到VIP100(0.5倍)。</p>
                <p>最终费用 = (阶梯计费总价) × (VIP折扣系数) × discount(额外折扣)。</p>
            </section>

            {/* 1. 获取公钥 */}
            <section>
                <h2>1. 获取公钥</h2>
                <input
                    type="text"
                    placeholder="User ID"
                    value={userIdForKey}
                    onChange={(e) => setUserIdForKey(e.target.value)}
                />
                <button onClick={fetchPublicKey}>获取公钥</button>
                {publicKey && (
                    <textarea
                        readOnly
                        value={publicKey}
                        rows={10}
                        placeholder="公钥将显示在此处..."
                    ></textarea>
                )}
                {getKeyResponse && (
                    <div className="success">
                        <strong>成功:</strong> {getKeyResponse}
                    </div>
                )}
                {getKeyError && (
                    <div className="error">
                        <strong>错误:</strong> {getKeyError}
                    </div>
                )}
            </section>

            {/* 2. Login Tester */}
            <section>
                <h2>2. Login Tester</h2>
                <form onSubmit={handleLoginTester}>
                    <input
                        type="text"
                        placeholder="User ID"
                        value={loginTesterUserId}
                        onChange={(e) => setLoginTesterUserId(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={loginTesterPassword}
                        onChange={(e) => setLoginTesterPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login Tester</button>
                </form>
                {loginTesterResponse && (
                    <div className="success">
                        <strong>成功:</strong> {loginTesterResponse}
                    </div>
                )}
                {loginTesterError && (
                    <div className="error">
                        <strong>错误:</strong> {loginTesterError}
                    </div>
                )}
            </section>

            {/* 3. 登录 */}
            <section>
                <h2>3. 登录</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">登录</button>
                </form>
                {loginResponse && (
                    <div className="success">
                        <strong>成功:</strong> {loginResponse}
                    </div>
                )}
                {loginError && (
                    <div className="error">
                        <strong>错误:</strong> {loginError}
                    </div>
                )}
            </section>

            {/* 4. 管理白名单 */}
            <section>
                <h2>4. 管理白名单</h2>
                <form onSubmit={handleWhitelist}>
                    <input
                        type="text"
                        placeholder="User ID 添加/移除白名单"
                        value={whitelistUserId}
                        onChange={(e) => setWhitelistUserId(e.target.value)}
                        required
                    />
                    <div>
                        <label>
                            <input
                                type="radio"
                                name="whitelistAction"
                                value="add"
                                checked={whitelistAction === 'add'}
                                onChange={() => setWhitelistAction('add')}
                            />
                            添加到白名单
                        </label>
                        <label style={{ marginLeft: '20px' }}>
                            <input
                                type="radio"
                                name="whitelistAction"
                                value="remove"
                                checked={whitelistAction === 'remove'}
                                onChange={() => setWhitelistAction('remove')}
                            />
                            从白名单移除
                        </label>
                    </div>
                    <button type="submit">
                        {whitelistAction === 'add' ? '添加到白名单' : '从白名单移除'}
                    </button>
                </form>
                {whitelistResponse && (
                    <div className="success">
                        <strong>成功:</strong> {whitelistResponse}
                    </div>
                )}
                {whitelistError && (
                    <div className="error">
                        <strong>错误:</strong> {whitelistError}
                    </div>
                )}
            </section>

            {/* 5. 创建用户 */}
            <section>
                <h2>5. 创建用户</h2>
                <form onSubmit={handleCreateUser}>
                    <input
                        type="text"
                        placeholder="新用户 ID"
                        value={createUserData.userId}
                        onChange={(e) =>
                            setCreateUserData({ ...createUserData, userId: e.target.value })
                        }
                        required
                    />
                    <input
                        type="text"
                        placeholder="用户名"
                        value={createUserData.username}
                        onChange={(e) =>
                            setCreateUserData({ ...createUserData, username: e.target.value })
                        }
                        required
                    />
                    <button type="submit">创建用户</button>
                </form>
                {createUserResponse && (
                    <div className="success">
                        <strong>成功:</strong> {createUserResponse}
                    </div>
                )}
                {createUserError && (
                    <div className="error">
                        <strong>错误:</strong> {createUserError}
                    </div>
                )}
            </section>

            {/* 6. 获取用户信息 */}
            <section>
                <h2>6. 获取用户信息</h2>
                <button onClick={fetchUserInfo}>获取用户信息</button>
                {userInfo && (
                    <pre className="response">
                        {JSON.stringify(userInfo, null, 2)}
                    </pre>
                )}
                {userInfoError && (
                    <div className="error">
                        <strong>错误:</strong> {userInfoError}
                    </div>
                )}
            </section>

            {/* 7. 获取 Prisma 表数据 */}
            <section>
                <h2>7. 获取 Prisma 表数据</h2>
                <form onSubmit={fetchPrismaData}>
                    <input
                        type="text"
                        placeholder="Prisma 表名"
                        value={prismaTable}
                        onChange={(e) => setPrismaTable(e.target.value)}
                        required
                    />
                    <button type="submit">获取数据</button>
                </form>
                {prismaData && (
                    <pre className="response">
                        {JSON.stringify(prismaData, null, 2)}
                    </pre>
                )}
                {prismaError && (
                    <div className="error">
                        <strong>错误:</strong> {prismaError}
                    </div>
                )}
            </section>

            {/* 8. 登出 */}
            <section>
                <h2>8. 登出</h2>
                <button onClick={handleLogout}>登出</button>
                {logoutResponse && (
                    <div className="success">
                        <strong>成功:</strong> {logoutResponse.message}
                    </div>
                )}
                {logoutError && (
                    <div className="error">
                        <strong>错误:</strong> {logoutError}
                    </div>
                )}
            </section>

            {/* 9. 输入入店时间戳计算预计消费 */}
            <section>
                <h2>9. 输入入店时间戳计算预计消费(测试)</h2>
                <form onSubmit={handleConsumptionCalculation}>
                    <input
                        type="text"
                        placeholder="输入入店时间戳 (毫秒)"
                        value={enterTimestamp}
                        onChange={(e) => setEnterTimestamp(e.target.value)}
                        required
                    />
                    <button type="submit">计算消费</button>
                </form>
                {estimatedResult && (
                    <div className="success">
                        <strong>游玩时间:</strong> {estimatedResult.playTimeStr}<br />
                        <strong>预计消费(测试):</strong> ￥{estimatedResult.cost.toFixed(2)}
                    </div>
                )}
                {consumptionError && (
                    <div className="error">
                        <strong>错误:</strong> {consumptionError}
                    </div>
                )}
            </section>

            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }

                h1 {
                    text-align: center;
                    color: #333;
                    margin-bottom: 40px;
                }

                section {
                    margin-bottom: 40px;
                }

                h2 {
                    color: #555;
                    margin-bottom: 20px;
                }

                input[type='text'],
                input[type='password'],
                textarea {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 10px;
                    font-size: 16px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }

                textarea {
                    resize: vertical;
                }

                button {
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    background-color: #0070f3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    transition: background-color 0.2s ease;
                }

                button:hover {
                    background-color: #005bb5;
                }

                label {
                    margin-right: 10px;
                    font-weight: bold;
                }

                .success {
                    background-color: #e0ffe0;
                    padding: 10px;
                    border: 1px solid #00cc00;
                    border-radius: 4px;
                    margin-top: 10px;
                }

                .error {
                    background-color: #ffe0e0;
                    padding: 10px;
                    border: 1px solid #cc0000;
                    border-radius: 4px;
                    margin-top: 10px;
                }

                .response {
                    background-color: #e0ffe0;
                    padding: 10px;
                    border: 1px solid #00cc00;
                    border-radius: 4px;
                    white-space: pre-wrap;
                    margin-top: 10px;
                }

                form > div {
                    margin-bottom: 10px;
                }

                input[type='radio'] {
                    margin-right: 5px;
                }
            `}</style>
        </div>
    );
};

export default TestPage;
