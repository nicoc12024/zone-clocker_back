import { getDb } from "../../db.js";

// Add employee
export const addEmployee = async (req, res) => {
  const { name, id_number, birthday, email, zone, is_active, mobile_number, id_zone } =
    req.body;
  let connection;

  // Validate the name length
  if (name.length > 25) {
    return res.status(400).json({ error: "Name exceeds 25 characters" });
  }

  try {
    connection = await getDb();
    const adminInfo = req.userInfo;

    // This info is from the admin that is logged in that comes from the token
    const { id_company } = adminInfo;

    // Check if email already exists
    const emailExists = await connection.query(
      "SELECT COUNT(*) FROM employee WHERE email = ?",
      [email]
    );

    if (emailExists[0]["COUNT(*)"] > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Check if ID number already exists
    const idNumberExistsQuery = await connection.query(
      "SELECT EXISTS(SELECT 1 FROM employee WHERE id_number = ?) AS id_exists",
      [id_number]
    );

    const idExists = idNumberExistsQuery[0].id_exists;

    if (idExists) {
      return res.status(400).json({ error: "ID number already exists" });
    }

    console.log("idNumberExists", idNumberExistsQuery[0].id_exists);

    // await connection.query(
    //   "INSERT INTO employee (id_number, id_zone, name, birthday, email, zone, is_active, mobile_number, id_company) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    //   [
    //     id_number,
    //     id_zone,
    //     name,
    //     birthday,
    //     email,
    //     zone,
    //     is_active,
    //     mobile_number,
    //     id_company,
    //   ]
    // );

    return res.status(201).json({ message: "Employee successfully created" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Get employees
export const getEmployees = async (req, res) => {
  let connection;
  try {
    connection = await getDb();
    const adminInfo = req.userInfo;

    // This info is from the admin that is logged in that comes from the token
    const { id_company } = adminInfo;

    const [data] = await connection.query("SELECT * FROM employee WHERE id_company = ?", [
      id_company,
    ]);

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  let connection;

  const { id: id_employee } = req.params;
  const { name, id_number, birthday, email, zone, is_active, mobile_number, id_zone } =
    req.body;

  try {
    connection = await getDb();
    await connection.query(
      `UPDATE employee 
         SET name = ?, id_number = ?, birthday = ?, email = ?, zone = ?, is_active = ?, mobile_number = ?, id_zone = ? 
         WHERE id_employee = ?`,
      [
        name,
        id_number,
        birthday,
        email,
        zone,
        is_active,
        mobile_number,
        id_zone,
        id_employee,
      ]
    );

    return res.status(200).json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  let connection;
  try {
    connection = await getDb();

    // Extract id_zone from the request body
    const { id: id_employee } = req.params;

    // Delete the zone data
    await connection.query(`DELETE FROM employee WHERE id_employee = ?`, [id_employee]);

    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Update zone for multiple employees to a "" when a zone is deleted
export const updateZoneForEmployees = async (req, res) => {
  let connection;
  try {
    const { id_zone } = req.body;
    connection = await getDb();

    await connection.query(`UPDATE employee SET zone = '' WHERE id_zone = ?`, [id_zone]);

    return res.status(200).json({ message: "Zone updated for employees successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
