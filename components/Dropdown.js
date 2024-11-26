import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';

const DropDown = ({ options, selectedValue, onValueChange, placeholder = "Select an option", isDarkMode }) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleSelect = (value) => {
        onValueChange(value);
        setIsVisible(false);
    };

    const themeStyles = isDarkMode ? darkThemeStyles : lightThemeStyles;

    return (
        <View style={themeStyles.container}>
            {/* Dropdown Trigger */}
            <TouchableOpacity style={themeStyles.dropdown} onPress={() => setIsVisible(true)}>
                <Text style={themeStyles.selectedText}>{selectedValue || placeholder}</Text>
            </TouchableOpacity>

            {/* Dropdown Modal */}
            <Modal visible={isVisible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
                    <View style={themeStyles.modalOverlay} />
                </TouchableWithoutFeedback>

                <View style={themeStyles.modalContainer}>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={themeStyles.item} onPress={() => handleSelect(item)}>
                                <Text style={themeStyles.itemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
};

const lightThemeStyles = StyleSheet.create({
    container: {
        width: 'auto',
    },
    dropdown: {
        borderColor: '#ccc',
        borderRadius: 5,
        height: 50,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        width: 60,
    },
    selectedText: {
        fontSize: 16,
    },
    modalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
    },
    modalContainer: {
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        maxHeight: '60%',
        padding: 10,
        position: 'absolute',
        top: '30%',
        width: '50%',
    },
    item: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    itemText: {
        fontSize: 16,
    },
});

const darkThemeStyles = StyleSheet.create({
    container: {
        width: 'auto',
    },
    dropdown: {
        borderColor: '#262e35',
        borderRadius: 5,
        borderWidth: 1,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 10,
        width: 60,
    },
    selectedText: {
        color: '#fff',
        fontSize: 16,
    },
    modalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
    },
    modalContainer: {
        alignSelf: 'center',
        backgroundColor: '#0f172a',
        borderRadius: 10,
        padding: 10,
        position: 'absolute',
        maxHeight: '60%',
        top: '30%',
        width: '50%',
    },
    item: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    itemText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default DropDown;