import {useState} from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const PasswordStrengthChecker = () => {
	const [password, setPassword] = useState("");
	const [strength, setStrength] = useState(0);

	const forbiddenPasswords = [
		"123456",
		"password",
		"123456789",
		"12345678",
		"12345",
		"1234567",
		"1234567890",
		"qwerty",
		"abcdef",
		"abc123",
		"111111",
		"123123",
		"letmein",
		"welcome",
		"monkey",
		"1234",
		"123321",
		"password1",
		"admin",
		"dragon",
		"baseball",
		"iloveyou",
		"trustno1",
		"sunshine",
		"123qwe",
		"football",
		"whatever",
		"qazwsx",
		"superman",
		"ashley",
		"batman",
		"zaq1zaq1",
		"123qweasd",
		"aa123456",
		"bailey",
		"charlie",
		"michael",
		"jessica",
		"harley",
		"daniel",
		"hannah",
		"snoopy",
		"ginger",
		"maggie",
		"peanut",
		"shadow",
		"tigger",
		"cookie",
		"biteme",
		"killer",
		"badboy",
		"banana",
		"maggie123",
		"startrek",
		"cheese",
		"qwertyuiop",
		"passw0rd",
		"jordan23",
		"letmein123",
		"football1",
		"mickey",
		"summer",
		"sweety",
		"family",
		"121212",
		"password123",
		"654321",
		"ginger1",
		"1q2w3e4r",
		"1qaz2wsx",
		"master",
		"qwe123",
		"987654321",
		"whatever1",
		"batman123",
		"hunter",
		"matrix",
		"freedom",
		"starwars",
		"george",
		"q1w2e3r4",
		"qazwsxedc",
		"pass123",
		"william",
		"abcd1234",
		"ginger123",
		"williams",
		"killer123",
		"soccer",
		"batman1",
		"access",
		"123456a",
		"admin123",
		"internet",
		"poohbear",
		"qwerty123",
		"loveyou",
		"letmein1",
		"ferrari",
		"987654",
		"asd123",
		"123asd",
		"computer",
		"creative",
		"apple",
		"123123123",
	];

	const calculateStrength = (password) => {
		let strength = 0;

		if (password.length >= 8) strength += 1;
		if (/[A-Z]/.test(password)) strength += 1;
		if (/[a-z]/.test(password)) strength += 1;
		if (/\d/.test(password)) strength += 1;
		if (/[\W_]/.test(password)) strength += 1;
		if (!/(\d)\1{2}/.test(password)) strength += 1; // No consecutive numbers
		if (!forbiddenPasswords.includes(password)) strength += 1; // Not a common password

		setStrength(strength);
	};

	const handleChange = (e) => {
		const newPassword = e.target.value;
		setPassword(newPassword);
		calculateStrength(newPassword);
	};

	const strengthColor = () => {
		switch (strength) {
			case 1:
			case 2:
				return "bg-gray-300";
			case 3:
			case 4:
				return "bg-red-500";
			case 5:
			case 6:
				return "bg-yellow-500";
			default:
				return "bg-green-500";
		}
	};

	return (
		<div className="password-strength-checker">
			<input
				type="text"
				value={password}
				onChange={handleChange}
				placeholder="Enter your password"
				className="border p-2 rounded w-full"
			/>
			<div className="mt-2 h-2 w-full bg-gray-300 rounded">
				<div
					className={classNames("h-2 rounded", strengthColor())}
					style={{width: `${(strength / 7) * 100}%`}} // There are 7 conditions to meet
				/>
			</div>
			<p className="mt-2">
				{strength === 7
					? "Tu Contraseña es segura"
					: "Tu Contraseña no es segura"}
			</p>
		</div>
	);
};

PasswordStrengthChecker.propTypes = {
	password: PropTypes.string,
	strength: PropTypes.number,
};

export default PasswordStrengthChecker;
