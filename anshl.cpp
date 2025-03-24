def find_first_non_repeating_char(s):
    count = {}
    
    for char in s:
        count[char] = count.get(char, 0) + 1

    for char in s:
        if count[char] == 1:
            return char

    return None

def main():
    s = input("Enter a string: ")
    result = find_first_non_repeating_char(s)
    
    if result:
        print(f"The first non-repeating character is: {result}")
    else:
        print("No non-repeating character found.")

if _name_ == "_main_":
    main()