import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { AppColors } from '../../constants/appcolors';
import { AppFonts } from '../../constants/appFonts';
import { setDarkMode } from '../../redux/slice/themeReducer';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@rneui/base';

const Profile = () => {
    const user = useSelector((state: any) => state.user.userDetails);
    const darkMode = useSelector((state: any) => state.theme.darkMode);
    const dispatch = useDispatch();
    const navigation = useNavigation();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#181818' : AppColors.background }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10, padding: 4 }}>
                    <Icon type="material" name="arrow-back" size={26} color={darkMode ? '#fff' : AppColors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.header, { color: darkMode ? '#fff' : AppColors.textPrimary, marginBottom: 0 }]}>Profile</Text>
            </View>
            <View style={styles.card}>
                <Text style={[styles.label, { color: darkMode ? '#fff' : AppColors.textPrimary }]}>Name:</Text>
                <Text style={[styles.value, { color: darkMode ? '#fff' : AppColors.textPrimary }]}>{user?.fullName || '-'}</Text>
                <Text style={[styles.label, { color: darkMode ? '#fff' : AppColors.textPrimary }]}>Email:</Text>
                <Text style={[styles.value, { color: darkMode ? '#fff' : AppColors.textPrimary }]}>{user?.email || '-'}</Text>
            </View>
            <View style={styles.toggleRow}>
                <Text style={{ color: darkMode ? '#fff' : AppColors.textPrimary, fontFamily: AppFonts.normal, fontSize: 16 }}>Dark Mode</Text>
                <Switch
                    value={darkMode}
                    onValueChange={v => { dispatch(setDarkMode(v)); }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 28, fontFamily: AppFonts.bold, marginBottom: 20 },
    card: { backgroundColor: '#2222', borderRadius: 10, padding: 20, marginBottom: 30 },
    label: { fontSize: 16, fontFamily: AppFonts.normal, marginTop: 10 },
    value: { fontSize: 18, fontFamily: AppFonts.bold, marginBottom: 10 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
});

export default Profile;