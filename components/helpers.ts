export const getVipLevel = (consumption: number): number => {
    const level = Math.floor(consumption / 50);
    return level > 100 ? 100 : level;
};

export const getVipDiscountFactor = (vipLevel: number): number => {
    return 1.0 - vipLevel * 0.005;
};
